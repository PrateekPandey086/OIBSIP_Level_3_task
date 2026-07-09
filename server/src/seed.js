require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Pizza = require('./models/Pizza');
const Inventory = require('./models/Inventory');
const Coupon = require('./models/Coupon');
const Reward = require('./models/Reward');

const pizzas = [
    {
        name: 'Margherita Classica',
        description: 'Simple yet elegant. San Marzano tomato sauce, fresh mozzarella, fresh basil, and a drizzle of extra virgin olive oil.',
        image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80',
        category: 'classic',
        basePrice: 249,
        sizes: { small: 0, medium: 100, large: 200 },
        ingredients: ['Tomato Sauce', 'Mozzarella', 'Basil', 'Olive Oil'],
        calories: 800,
        cookTime: '15-20 min',
        rating: 4.8,
        isVeg: true,
        isFeatured: true,
        tags: ['classic', 'veg', 'cheese'],
    },
    {
        name: 'Double Cheese Margherita',
        description: 'For the cheese lovers. A double layer of fresh mozzarella cheese on our signature tomato sauce base.',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        category: 'classic',
        basePrice: 299,
        sizes: { small: 0, medium: 120, large: 240 },
        ingredients: ['Tomato Sauce', 'Mozzarella', 'Extra Cheese'],
        calories: 1100,
        cookTime: '15-20 min',
        rating: 4.7,
        isVeg: true,
        isFeatured: false,
        tags: ['classic', 'veg', 'double-cheese'],
    },
    {
        name: 'Farmhouse Special',
        description: 'A colorful medley of fresh farm vegetables: crisp onions, capsicum, juicy tomatoes, and earthy mushrooms.',
        image: 'https://images.unsplash.com/photo-1571066811602-716837d681de?auto=format&fit=crop&w=800&q=80',
        category: 'veg',
        basePrice: 349,
        sizes: { small: 0, medium: 130, large: 260 },
        ingredients: ['Tomato Sauce', 'Mozzarella', 'Onion', 'Capsicum', 'Tomato', 'Mushroom'],
        calories: 950,
        cookTime: '20-25 min',
        rating: 4.6,
        isVeg: true,
        isFeatured: true,
        tags: ['veg', 'farmhouse', 'healthy'],
    },
    {
        name: 'Paneer Tikka Butter',
        description: 'An Indian fusion masterpiece. Succulent paneer tikka chunks, capsicum, red paprika, and a rich butter gravy drizzle.',
        image: 'https://images.unsplash.com/photo-1594007654729-407ededc4963?auto=format&fit=crop&w=800&q=80',
        category: 'special',
        basePrice: 399,
        sizes: { small: 0, medium: 150, large: 300 },
        ingredients: ['Tomato Sauce', 'Mozzarella', 'Paneer Tikka', 'Capsicum', 'Red Paprika'],
        calories: 1200,
        cookTime: '20-25 min',
        rating: 4.9,
        isVeg: true,
        isFeatured: true,
        tags: ['special', 'veg', 'paneer', 'spicy'],
    },
    {
        name: 'Spicy Triple Tango',
        description: 'A spicy dance of golden corn, jalapenos, and red paprika, topped with premium mozzarella cheese.',
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
        category: 'veg',
        basePrice: 329,
        sizes: { small: 0, medium: 120, large: 240 },
        ingredients: ['Tomato Sauce', 'Mozzarella', 'Corn', 'Jalapeno', 'Red Paprika'],
        calories: 900,
        cookTime: '15-20 min',
        rating: 4.5,
        isVeg: true,
        isFeatured: false,
        tags: ['veg', 'spicy', 'corn'],
    },
    {
        name: 'Fiery Pepperoni',
        description: 'Classic American pepperoni pizza with a fiery kick of sliced jalapenos and red chili flakes.',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
        category: 'non-veg',
        basePrice: 449,
        sizes: { small: 0, medium: 160, large: 320 },
        ingredients: ['Tomato Sauce', 'Mozzarella', 'Pepperoni', 'Jalapeno'],
        calories: 1300,
        cookTime: '15-20 min',
        rating: 4.9,
        isVeg: false,
        isFeatured: true,
        tags: ['non-veg', 'pepperoni', 'spicy'],
    },
    {
        name: 'Chicken Tikka Supreme',
        description: 'Tender chicken tikka chunks, sliced onions, capsicum, and fresh coriander on a spicy tomato base.',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
        category: 'non-veg',
        basePrice: 429,
        sizes: { small: 0, medium: 150, large: 300 },
        ingredients: ['Tomato Sauce', 'Mozzarella', 'Chicken Tikka', 'Onion', 'Capsicum'],
        calories: 1150,
        cookTime: '20-25 min',
        rating: 4.8,
        isVeg: false,
        isFeatured: true,
        tags: ['non-veg', 'chicken', 'indian'],
    },
    {
        name: 'Barbeque Chicken Feast',
        description: 'Smoky BBQ chicken strips, sweet red onions, and fresh cilantro, drizzled with sweet and tangy BBQ sauce.',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        category: 'premium',
        basePrice: 479,
        sizes: { small: 0, medium: 170, large: 340 },
        ingredients: ['Barbeque Sauce', 'Mozzarella', 'BBQ Chicken', 'Onion'],
        calories: 1250,
        cookTime: '20-25 min',
        rating: 4.7,
        isVeg: false,
        isFeatured: false,
        tags: ['premium', 'non-veg', 'bbq', 'chicken'],
    },
    {
        name: 'Truffle Mushroom & Spinach',
        description: 'Gourmet white sauce pizza with wild mushrooms, baby spinach, caramelized onions, and a drizzle of truffle oil.',
        image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
        category: 'premium',
        basePrice: 499,
        sizes: { small: 0, medium: 180, large: 360 },
        ingredients: ['White Sauce', 'Mozzarella', 'Mushroom', 'Spinach', 'Onion', 'Truffle Oil'],
        calories: 1050,
        cookTime: '20-25 min',
        rating: 4.9,
        isVeg: true,
        isFeatured: true,
        tags: ['premium', 'veg', 'truffle', 'gourmet'],
    },
    {
        name: 'Pesto Veggie Delight',
        description: 'Fragrant basil pesto sauce base topped with cherry tomatoes, black olives, artichoke hearts, and feta cheese.',
        image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&q=80',
        category: 'premium',
        basePrice: 459,
        sizes: { small: 0, medium: 160, large: 320 },
        ingredients: ['Pesto Sauce', 'Mozzarella', 'Tomato', 'Olives', 'Feta Cheese'],
        calories: 980,
        cookTime: '15-20 min',
        rating: 4.6,
        isVeg: true,
        isFeatured: false,
        tags: ['premium', 'veg', 'pesto', 'gourmet'],
    },
    {
        name: 'Peri Peri Chicken',
        description: 'Spicy peri-peri marinated chicken chunks, red onions, capsicum, and red paprika, topped with peri-peri mayo.',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
        category: 'special',
        basePrice: 439,
        sizes: { small: 0, medium: 150, large: 300 },
        ingredients: ['Peri Peri Sauce', 'Mozzarella', 'Peri Peri Chicken', 'Onion', 'Capsicum'],
        calories: 1180,
        cookTime: '20-25 min',
        rating: 4.7,
        isVeg: false,
        isFeatured: false,
        tags: ['special', 'non-veg', 'peri-peri', 'spicy'],
    },
    {
        name: 'Garden Harvest Pizza',
        description: 'Loaded with broccoli florets, sweet corn, baby spinach, red onions, and bell peppers on a whole wheat crust.',
        image: 'https://images.unsplash.com/photo-1571066811602-716837d681de?auto=format&fit=crop&w=800&q=80',
        category: 'classic',
        basePrice: 319,
        sizes: { small: 0, medium: 110, large: 220 },
        ingredients: ['Tomato Sauce', 'Mozzarella', 'Broccoli', 'Corn', 'Spinach', 'Onion', 'Capsicum'],
        calories: 750,
        cookTime: '15-20 min',
        rating: 4.4,
        isVeg: true,
        isFeatured: false,
        tags: ['classic', 'veg', 'healthy', 'whole-wheat'],
    },
];

const inventoryItems = [
    // Bases
    { name: 'Thin Crust', category: 'base', quantity: 150, threshold: 30, unit: 'pieces', price: 40 },
    { name: 'Cheese Burst', category: 'base', quantity: 100, threshold: 25, unit: 'pieces', price: 90 },
    { name: 'Stuffed Crust', category: 'base', quantity: 80, threshold: 20, unit: 'pieces', price: 80 },
    { name: 'Pan Pizza', category: 'base', quantity: 120, threshold: 30, unit: 'pieces', price: 50 },
    { name: 'Whole Wheat', category: 'base', quantity: 60, threshold: 15, unit: 'pieces', price: 60 },

    // Sauces
    { name: 'Tomato Sauce', category: 'sauce', quantity: 500, threshold: 100, unit: 'ml', price: 10 },
    { name: 'Peri Peri Sauce', category: 'sauce', quantity: 300, threshold: 60, unit: 'ml', price: 20 },
    { name: 'Barbeque Sauce', category: 'sauce', quantity: 250, threshold: 50, unit: 'ml', price: 20 },
    { name: 'White Sauce', category: 'sauce', quantity: 350, threshold: 70, unit: 'ml', price: 25 },
    { name: 'Pesto Sauce', category: 'sauce', quantity: 200, threshold: 40, unit: 'ml', price: 30 },

    // Cheese
    { name: 'Mozzarella', category: 'cheese', quantity: 400, threshold: 80, unit: 'grams', price: 50 },
    { name: 'Cheddar', category: 'cheese', quantity: 250, threshold: 50, unit: 'grams', price: 60 },
    { name: 'Parmesan', category: 'cheese', quantity: 150, threshold: 30, unit: 'grams', price: 80 },
    { name: 'Double Cheese', category: 'cheese', quantity: 300, threshold: 60, unit: 'grams', price: 90 },
    { name: 'Vegan Cheese', category: 'cheese', quantity: 100, threshold: 20, unit: 'grams', price: 70 },

    // Veggies
    { name: 'Onion', category: 'veggie', quantity: 200, threshold: 40, unit: 'grams', price: 15 },
    { name: 'Capsicum', category: 'veggie', quantity: 180, threshold: 35, unit: 'grams', price: 20 },
    { name: 'Tomato', category: 'veggie', quantity: 150, threshold: 30, unit: 'grams', price: 15 },
    { name: 'Olives', category: 'veggie', quantity: 120, threshold: 25, unit: 'grams', price: 35 },
    { name: 'Mushroom', category: 'veggie', quantity: 140, threshold: 30, unit: 'grams', price: 30 },
    { name: 'Corn', category: 'veggie', quantity: 160, threshold: 30, unit: 'grams', price: 20 },
    { name: 'Jalapeno', category: 'veggie', quantity: 100, threshold: 20, unit: 'grams', price: 30 },
    { name: 'Paneer', category: 'veggie', quantity: 120, threshold: 25, unit: 'grams', price: 40 },
    { name: 'Broccoli', category: 'veggie', quantity: 80, threshold: 15, unit: 'grams', price: 35 },
    { name: 'Spinach', category: 'veggie', quantity: 90, threshold: 20, unit: 'grams', price: 25 },

    // Extras
    { name: 'Garlic Bread', category: 'extra', quantity: 100, threshold: 20, unit: 'pieces', price: 99 },
    { name: 'Cold Drink', category: 'extra', quantity: 200, threshold: 40, unit: 'pieces', price: 57 },
    { name: 'Cheese Dip', category: 'extra', quantity: 150, threshold: 30, unit: 'pieces', price: 25 },
    { name: 'Extra Cheese', category: 'extra', quantity: 120, threshold: 25, unit: 'pieces', price: 75 },
    { name: 'Dessert', category: 'extra', quantity: 80, threshold: 15, unit: 'pieces', price: 129 },
];

const coupons = [
    { code: 'PIZZACRAFT20', type: 'percentage', discount: 20, maxDiscount: 150, minOrder: 400, expiryDate: new Date('2027-12-31'), description: '20% off up to ₹150 on orders above ₹400' },
    { code: 'FLAT100', type: 'flat', discount: 100, minOrder: 600, expiryDate: new Date('2027-12-31'), description: 'Flat ₹100 off on orders above ₹600' },
    { code: 'WELCOME50', type: 'percentage', discount: 50, maxDiscount: 200, minOrder: 300, expiryDate: new Date('2027-12-31'), description: '50% off up to ₹200 for new users' },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pizza-deli');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Pizza.deleteMany({});
        await Inventory.deleteMany({});
        await Coupon.deleteMany({});
        await Reward.deleteMany({});

        console.log('Cleared existing collections.');

        // Seed Admin
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzeria.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
        const admin = await User.create({
            name: 'Admin Chef',
            email: adminEmail,
            password: adminPassword,
            phone: '9876543210',
            role: 'admin',
            isVerified: true,
        });
        console.log(`Admin user created: ${adminEmail}`);

        // Seed Customer
        const customer = await User.create({
            name: 'John Doe',
            email: 'customer@pizzeria.com',
            password: 'Customer@123',
            phone: '9876543211',
            role: 'customer',
            isVerified: true,
            addresses: [
                {
                    label: 'Home',
                    street: '123 Pizza Lane, Cheese Sector',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zipCode: '400001',
                    isDefault: true,
                },
            ],
        });
        await Reward.create({
            user: customer._id,
            points: 150,
            totalEarned: 150,
            milestones: [
                { name: 'First Order', ordersRequired: 1 },
                { name: 'Pizza Lover', ordersRequired: 5 },
                { name: 'Pizza Expert', ordersRequired: 10 },
                { name: 'Pizza Master', ordersRequired: 25 },
            ],
        });
        console.log('Customer user created: customer@pizzeria.com');

        // Seed Pizzas
        await Pizza.insertMany(pizzas);
        console.log(`Seeded ${pizzas.length} pizzas.`);

        // Seed Inventory
        await Inventory.insertMany(inventoryItems);
        console.log(`Seeded ${inventoryItems.length} inventory items.`);

        // Seed Coupons
        await Coupon.insertMany(coupons);
        console.log(`Seeded ${coupons.length} coupons.`);

        console.log('Database seeding completed successfully!');
        if (require.main === module) {
            process.exit(0);
        }
    } catch (error) {
        console.error('Error seeding database:', error);
        if (require.main === module) {
            process.exit(1);
        }
        throw error;
    }
};

if (require.main === module) {
    seed();
}

module.exports = seed;
