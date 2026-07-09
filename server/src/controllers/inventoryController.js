const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const { lowStockTemplate } = require('../templates/emailTemplates');
const { getIO } = require('../config/socket');

// Get all inventory
exports.getInventory = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    let query = {};

    if (req.query.category) query.category = req.query.category;
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) query.name = { $regex: req.query.search, $options: 'i' };

    let sortBy = 'name';
    if (req.query.sort === 'quantity-low') sortBy = 'quantity';
    if (req.query.sort === 'quantity-high') sortBy = '-quantity';
    if (req.query.sort === 'name') sortBy = 'name';

    const items = await Inventory.find(query).skip(skip).limit(limit).sort(sortBy);
    const total = await Inventory.countDocuments(query);

    res.json({ status: 'success', items, total, pages: Math.ceil(total / limit), page });
});

// Get by category
exports.getByCategory = asyncHandler(async (req, res) => {
    const items = await Inventory.find({ category: req.params.category }).sort('name');
    res.json({ status: 'success', items });
});

// Get low stock
exports.getLowStock = asyncHandler(async (req, res) => {
    const items = await Inventory.find({ $expr: { $lte: ['$quantity', '$threshold'] } });
    res.json({ status: 'success', items });
});

// Create inventory item (admin)
exports.createInventory = asyncHandler(async (req, res) => {
    const item = await Inventory.create(req.body);
    res.status(201).json({ status: 'success', item });
});

// Update inventory (admin)
exports.updateInventory = asyncHandler(async (req, res, next) => {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return next(new AppError('Item not found', 404));
    res.json({ status: 'success', item });
});

// Update stock (admin)
exports.updateStock = asyncHandler(async (req, res, next) => {
    const { quantity, action, reason } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return next(new AppError('Item not found', 404));

    if (action === 'add') {
        item.quantity += quantity;
    } else if (action === 'deduct') {
        item.quantity = Math.max(0, item.quantity - quantity);
    } else {
        item.quantity = quantity;
    }

    item.stockHistory.push({ action: action === 'add' ? 'added' : action === 'deduct' ? 'deducted' : 'adjusted', quantity, reason: reason || `Stock ${action}` });

    await item.save();
    res.json({ status: 'success', item });
});

// Delete inventory (admin)
exports.deleteInventory = asyncHandler(async (req, res, next) => {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return next(new AppError('Item not found', 404));
    res.json({ status: 'success', message: 'Item deleted' });
});

// Deduct inventory for order
exports.deductForOrder = async (orderItems) => {
    const lowStockItems = [];

    const deductItem = async (name, category, reason) => {
        if (!name) return;
        const inv = await Inventory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, category });
        if (inv) {
            inv.quantity = Math.max(0, inv.quantity - 1);
            inv.stockHistory.push({ action: 'deducted', quantity: 1, reason });
            await inv.save();
            if (inv.quantity <= inv.threshold) lowStockItems.push(inv);
        }
    };

    for (const item of orderItems) {
        if (item.isCustom && item.customizations) {
            const { base, sauce, cheese, veggies, extras } = item.customizations;
            const reason = `Order: ${item.name || 'Custom Pizza'}`;

            if (base?.name) await deductItem(base.name, 'base', reason);
            if (sauce?.name) await deductItem(sauce.name, 'sauce', reason);
            if (cheese?.name) await deductItem(cheese.name, 'cheese', reason);
            if (veggies) for (const v of veggies) await deductItem(v.name, 'veggie', reason);
            if (extras) for (const e of extras) await deductItem(e.name, 'extra', reason);
        } else {
            // For standard menu pizzas, deduct a generic base, sauce and cheese per unit ordered
            const qty = item.quantity || 1;
            const reason = `Order: ${item.name || 'Pizza'}`;
            for (let i = 0; i < qty; i++) {
                // Deduct first available base, sauce, cheese from inventory
                const base = await Inventory.findOne({ category: 'base' }).sort('name');
                if (base) {
                    base.quantity = Math.max(0, base.quantity - 1);
                    base.stockHistory.push({ action: 'deducted', quantity: 1, reason });
                    await base.save();
                    if (base.quantity <= base.threshold) lowStockItems.push(base);
                }
                const sauce = await Inventory.findOne({ category: 'sauce' }).sort('name');
                if (sauce) {
                    sauce.quantity = Math.max(0, sauce.quantity - 1);
                    sauce.stockHistory.push({ action: 'deducted', quantity: 1, reason });
                    await sauce.save();
                    if (sauce.quantity <= sauce.threshold) lowStockItems.push(sauce);
                }
                const cheese = await Inventory.findOne({ category: 'cheese' }).sort('name');
                if (cheese) {
                    cheese.quantity = Math.max(0, cheese.quantity - 1);
                    cheese.stockHistory.push({ action: 'deducted', quantity: 1, reason });
                    await cheese.save();
                    if (cheese.quantity <= cheese.threshold) lowStockItems.push(cheese);
                }
            }
        }
    }

    // Send low stock alerts
    if (lowStockItems.length > 0) {
        const admins = await User.find({ role: 'admin' });

        for (const admin of admins) {
            await Notification.create({
                user: admin._id,
                title: '⚠️ Low Stock Alert',
                message: `${lowStockItems.map((i) => i.name).join(', ')} running low!`,
                type: 'inventory',
                isAdmin: true,
            });

            await sendEmail({
                to: admin.email,
                subject: 'Inventory Running Low - PizzaCraft',
                html: lowStockTemplate(lowStockItems),
            });
        }

        try {
            const io = getIO();
            io.to('admin-room').emit('lowStock', { items: lowStockItems });
        } catch (e) {
            console.error('Socket emit error:', e.message);
        }
    }

    return lowStockItems;
};
