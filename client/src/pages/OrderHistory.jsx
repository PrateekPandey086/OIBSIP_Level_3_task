import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const OrderHistory = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [page, setPage] = useState(1);

    // Fetch all orders
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['my-orders', page],
        queryFn: async () => {
            const response = await api.get(`/orders/my-orders?page=${page}&limit=5`);
            return response.data;
        },
    });

    const handleReorder = (order) => {
        order.items.forEach((item) => {
            addToCart({
                pizza: item.pizza,
                name: item.name,
                image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
                price: item.price,
                size: item.size,
                quantity: item.quantity,
                isCustom: !!item.customizations,
                customizations: item.customizations,
            });
        });
        toast.success('Items added to cart for reorder!');
        navigate('/checkout');
    };

    const handleDownloadInvoice = (order) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(230, 57, 70); // Primary color
        doc.text('PizzaCraft Invoice', 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 30);
        doc.text(`Order Number: #${order.orderNumber}`, 20, 35);
        doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 20, 40);

        // Divider
        doc.setDrawColor(200);
        doc.line(20, 45, 190, 45);

        // Items Header
        doc.setFontSize(12);
        doc.setTextColor(50);
        doc.text('Item Description', 20, 55);
        doc.text('Qty', 120, 55);
        doc.text('Price', 140, 55);
        doc.text('Total', 170, 55);

        doc.line(20, 58, 190, 58);

        // Items List
        let y = 65;
        order.items.forEach((item) => {
            doc.setFontSize(10);
            doc.text(item.name, 20, y);
            doc.text(item.quantity.toString(), 120, y);
            doc.text(`Rs. ${item.price}`, 140, y);
            doc.text(`Rs. ${item.price * item.quantity}`, 170, y);
            y += 10;
        });

        // Divider
        doc.line(20, y, 190, y);
        y += 10;

        // Totals
        doc.setFontSize(11);
        doc.text('Subtotal:', 130, y);
        doc.text(`Rs. ${order.total - Math.round(order.total * 0.05)}`, 170, y);
        y += 8;

        doc.text('GST (5%):', 130, y);
        doc.text(`Rs. ${Math.round(order.total * 0.05)}`, 170, y);
        y += 8;

        doc.setFontSize(12);
        doc.text('Grand Total:', 130, y);
        doc.text(`Rs. ${order.total}`, 170, y);

        // Save PDF
        doc.save(`invoice_${order.orderNumber}.pdf`);
        toast.success('Invoice downloaded successfully!');
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
            <div>
                <h1 className="text-4xl font-extrabold text-dark">Order History</h1>
                <p className="text-gray-500 mt-1">View and manage your past pizza orders</p>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-40 bg-gray-100 animate-pulse rounded-2xl"></div>
                    ))}
                </div>
            ) : !data?.orders || data.orders.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                    <span className="text-6xl">🍕</span>
                    <h3 className="text-2xl font-bold text-gray-700">No orders found</h3>
                    <p className="text-gray-500">You haven't ordered any pizzas yet.</p>
                    <Link
                        to="/menu"
                        className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-red-600 transition-colors shadow-md"
                    >
                        Order Now
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {data.orders.map((order) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                        >
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-dark">Order #{order.orderNumber}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${order.status === 'delivered'
                                        ? 'bg-green-100 text-green-700'
                                        : order.status === 'cancelled'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.status.replace(/-/g, ' ')}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Placed on: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                                <div className="flex flex-col gap-1 mt-2">
                                    {order.items.map((item, idx) => (
                                        <span key={idx} className="text-sm text-gray-700">
                                            {item.name} ({item.size}) x {item.quantity}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 self-stretch md:self-auto justify-between">
                                <span className="text-2xl font-extrabold text-dark">₹{order.total}</span>
                                <div className="flex gap-2 flex-wrap justify-end">
                                    <button
                                        onClick={() => handleDownloadInvoice(order)}
                                        className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Invoice PDF
                                    </button>
                                    <button
                                        onClick={() => handleReorder(order)}
                                        className="px-4 py-2 bg-dark text-white rounded-full text-xs font-bold hover:bg-primary transition-colors"
                                    >
                                        Reorder
                                    </button>
                                    <Link
                                        to={`/orders/${order._id}`}
                                        className="px-4 py-2 bg-primary text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors"
                                    >
                                        Track
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Pagination */}
                    {data.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {Array.from({ length: data.pages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${page === i + 1 ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
