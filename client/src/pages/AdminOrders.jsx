import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const ADMIN_STATUSES = [
    { value: 'received', label: 'Order Received' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in-kitchen', label: 'In the Kitchen' },
    { value: 'baking', label: 'Baking' },
    { value: 'quality-check', label: 'Quality Check' },
    { value: 'out-for-delivery', label: 'Sent to Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

const statusColor = (status) => {
    if (status === 'delivered') return 'bg-green-100 text-green-700';
    if (status === 'cancelled') return 'bg-red-100 text-red-700';
    if (status === 'out-for-delivery') return 'bg-blue-100 text-blue-700';
    if (status === 'in-kitchen' || status === 'baking') return 'bg-orange-100 text-orange-700';
    return 'bg-yellow-100 text-yellow-700';
};

const AdminOrders = () => {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [hasNewOrder, setHasNewOrder] = useState(false);

    // Fetch all orders
    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders', { statusFilter, page }],
        queryFn: async () => {
            const response = await api.get('/orders', {
                params: { status: statusFilter, page, limit: 10 },
            });
            return response.data;
        },
    });

    // Socket.io: join admin-room & listen for new orders
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        const socket = io(socketUrl, { withCredentials: true });

        socket.on('connect', () => {
            socket.emit('joinAdmin');
        });

        socket.on('newOrder', () => {
            setHasNewOrder(true);
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            toast.success('🍕 New order received!', { duration: 5000 });
        });

        socket.on('lowStock', ({ items }) => {
            toast.error(`⚠️ Low stock: ${items.map((i) => i.name).join(', ')}`, { duration: 8000 });
        });

        return () => socket.disconnect();
    }, [queryClient]);

    // Update order status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }) => {
            await api.put(`/orders/${orderId}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            toast.success('Order status updated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        },
    });

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark">Order Management</h1>
                    <p className="text-gray-500 mt-1">Manage and update all customer orders</p>
                    {hasNewOrder && (
                        <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            New orders arrived — list refreshed
                        </span>
                    )}
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                        setHasNewOrder(false);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary"
                >
                    <option value="">All Statuses</option>
                    {ADMIN_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-24 bg-gray-100 animate-pulse rounded-2xl"></div>
                    ))}
                </div>
            ) : !data?.orders || data.orders.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                    <span className="text-6xl">📦</span>
                    <h3 className="text-2xl font-bold text-gray-700">No orders found</h3>
                    <p className="text-gray-500">There are no orders matching the selected status.</p>
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
                                    <span className="text-xs text-gray-400">• {new Date(order.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Customer: <span className="font-semibold">{order.user?.name || 'Guest'}</span> ({order.user?.email || 'N/A'}) • Phone: {order.phone}
                                </p>
                                <div className="flex flex-col gap-1 mt-2">
                                    {order.items.map((item, idx) => (
                                        <span key={idx} className="text-sm text-gray-700">
                                            {item.name} ({item.size}) x {item.quantity}
                                        </span>
                                    ))}
                                </div>
                                <span className={`mt-1 px-3 py-1 rounded-full text-xs font-bold capitalize self-start ${statusColor(order.status)}`}>
                                    {ADMIN_STATUSES.find((s) => s.value === order.status)?.label || order.status}
                                </span>
                            </div>

                            <div className="flex flex-col items-end gap-3 self-stretch md:self-auto justify-between">
                                <span className="text-2xl font-extrabold text-dark">₹{order.total}</span>
                                <div className="flex gap-2 flex-wrap justify-end items-center">
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatusMutation.mutate({ orderId: order._id, status: e.target.value })}
                                        disabled={updateStatusMutation.isPending}
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary"
                                    >
                                        {ADMIN_STATUSES.map((s) => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
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

export default AdminOrders;
