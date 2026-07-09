import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';

const statuses = [
    { key: 'received', label: 'Order Received', desc: 'We have received your order' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Chef has accepted your order' },
    { key: 'in-kitchen', label: 'In the Kitchen', desc: 'Prepping fresh ingredients' },
    { key: 'baking', label: 'Baking', desc: 'Baking in our wood-fired oven' },
    { key: 'quality-check', label: 'Quality Check', desc: 'Ensuring pizza perfection' },
    { key: 'out-for-delivery', label: 'Sent to Delivery', desc: 'Rider is on the way' },
    { key: 'delivered', label: 'Delivered', desc: 'Enjoy your hot artisan pizza!' },
];

const OrderTracking = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [orderStatus, setOrderStatus] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);

    // Fetch order details
    const { data: orderData, isLoading } = useQuery({
        queryKey: ['order-details', id],
        queryFn: async () => {
            const response = await api.get(`/orders/${id}`);
            return response.data.order;
        },
    });

    useEffect(() => {
        if (orderData) {
            setOrderStatus(orderData.status);
        }
    }, [orderData]);

    // Socket.io connection for real-time updates
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        const socket = io(socketUrl, { withCredentials: true });

        socket.on('connect', () => {
            setSocketConnected(true);
            // Join user's personal room for notifications
            if (user?._id) socket.emit('join', user._id);
            // Join order-specific room for this order's tracking
            socket.emit('join-order-room', id);
        });

        socket.on('orderStatusUpdate', (data) => {
            if (data.orderId === id || data.orderId?.toString() === id) {
                setOrderStatus(data.status);
                queryClient.invalidateQueries({ queryKey: ['order-details', id] });
            }
        });

        socket.on('disconnect', () => setSocketConnected(false));

        return () => socket.disconnect();
    }, [id, user?._id, queryClient]);

    if (isLoading || !orderData) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-cream">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-primary font-semibold">Loading order tracking...</p>
                </div>
            </div>
        );
    }

    const currentStepIdx = statuses.findIndex((s) => s.key === orderStatus);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Tracking Timeline */}
            <div className="lg:col-span-8 flex flex-col gap-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold text-dark">Track Order</h1>
                        <p className="text-gray-500 mt-1">Order #{orderData.orderNumber}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${socketConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        {socketConnected ? 'Live Tracking Active' : 'Connecting...'}
                    </span>
                </div>

                {orderStatus === 'cancelled' ? (
                    <div className="glass p-8 rounded-2xl border-l-4 border-l-primary shadow-sm text-center">
                        <span className="text-6xl">❌</span>
                        <h2 className="text-2xl font-bold text-primary mt-4">Order Cancelled</h2>
                        <p className="text-gray-600 mt-2">This order has been cancelled. If you paid, a refund will be processed shortly.</p>
                        <Link to="/menu" className="mt-6 inline-block px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-red-600 transition-colors">
                            Order Again
                        </Link>
                    </div>
                ) : (
                    <div className="glass p-8 rounded-2xl shadow-sm flex flex-col gap-8">
                        <h3 className="text-xl font-bold text-dark border-b border-gray-100 pb-3">Status Timeline</h3>
                        <div className="flex flex-col gap-8 relative pl-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                            {statuses.map((status, idx) => {
                                const isCompleted = idx < currentStepIdx;
                                const isActive = idx === currentStepIdx;
                                return (
                                    <motion.div
                                        key={status.key}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="relative flex flex-col gap-1"
                                    >
                                        {/* Status Dot */}
                                        <div
                                            className={`absolute -left-[31px] w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isCompleted
                                                    ? 'bg-green-600 border-green-200'
                                                    : isActive
                                                        ? 'bg-primary border-red-200 animate-pulse'
                                                        : 'bg-white border-gray-200'
                                                }`}
                                        >
                                            {isCompleted && <span className="text-[10px] text-white font-bold">✓</span>}
                                        </div>

                                        <h4 className={`font-bold text-sm ${isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-gray-400'}`}>
                                            {status.label}
                                        </h4>
                                        <p className={`text-xs ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>{status.desc}</p>
                                        {isActive && (
                                            <span className="mt-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold self-start uppercase tracking-wider">
                                                Current Status
                                            </span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Order Summary & Delivery Partner */}
            <div className="lg:col-span-4 flex flex-col gap-8">
                {/* Delivery Partner */}
                {orderStatus === 'out-for-delivery' && (
                    <div className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                        <h3 className="text-lg font-bold text-dark">Delivery Partner</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">🚴</div>
                            <div>
                                <h4 className="font-bold text-sm text-dark">Ramesh Kumar</h4>
                                <p className="text-xs text-gray-500">Contact: +91 98765 01234</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Details */}
                <div className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-dark border-b border-gray-100 pb-3">Order Details</h3>
                    <div className="flex flex-col gap-4 max-h-80 overflow-y-auto pr-2">
                        {orderData.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start gap-4">
                                <div>
                                    <h4 className="font-bold text-sm text-dark">{item.name}</h4>
                                    <span className="text-xs text-gray-500 capitalize">Size: {item.size} • Qty: {item.quantity}</span>
                                </div>
                                <span className="font-bold text-sm text-dark">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex flex-col gap-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total Paid</span>
                            <span className="text-primary font-extrabold text-lg">₹{orderData.total}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Payment Status</span>
                            <span className="font-semibold text-green-600 capitalize">{orderData.paymentStatus}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Estimated Delivery</span>
                            <span className="font-semibold text-dark">{orderData.estimatedDelivery}</span>
                        </div>
                    </div>
                </div>

                <Link
                    to="/orders"
                    className="px-6 py-3 bg-white border border-gray-200 text-dark font-bold rounded-full shadow-sm hover:bg-gray-50 transition-all text-center text-sm"
                >
                    ← All Orders
                </Link>
            </div>
        </div>
    );
};

export default OrderTracking;
