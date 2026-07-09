import React, { useEffect } from 'react';
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

const AdminDashboard = () => {
    const queryClient = useQueryClient();

    // Real-time: join admin room
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        const socket = io(socketUrl, { withCredentials: true });
        socket.on('connect', () => socket.emit('joinAdmin'));
        socket.on('newOrder', () => {
            queryClient.invalidateQueries({ queryKey: ['admin-recent-orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            toast.success('🍕 New order received!', { duration: 5000 });
        });
        socket.on('lowStock', ({ items }) => {
            queryClient.invalidateQueries({ queryKey: ['admin-low-stock'] });
            toast.error(`⚠️ Low stock: ${items.map((i) => i.name).join(', ')}`, { duration: 8000 });
        });
        return () => socket.disconnect();
    }, [queryClient]);

    // Fetch dashboard stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const response = await api.get('/analytics/dashboard');
            return response.data.stats;
        },
    });

    // Fetch recent orders
    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['admin-recent-orders'],
        queryFn: async () => {
            const response = await api.get('/orders?limit=5');
            return response.data;
        },
    });

    // Fetch low stock items
    const { data: lowStockData, isLoading: lowStockLoading } = useQuery({
        queryKey: ['admin-low-stock'],
        queryFn: async () => {
            const response = await api.get('/inventory/low-stock');
            return response.data.items;
        },
    });

    // Update order status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }) => {
            await api.put(`/orders/${orderId}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-recent-orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            toast.success('Order status updated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        },
    });

    if (statsLoading || ordersLoading || lowStockLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-cream">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-primary font-semibold">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    const widgets = [
        { title: 'Total Revenue', value: `₹${statsData?.totalRevenue || 0}`, icon: '💰', color: 'from-green-500 to-emerald-600' },
        { title: 'Total Orders', value: statsData?.totalOrders || 0, icon: '📦', color: 'from-primary to-red-600' },
        { title: 'Low Stock Items', value: lowStockData?.length || 0, icon: '⚠️', color: 'from-amber-500 to-orange-600' },
        { title: 'Active Users', value: statsData?.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-indigo-600' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage orders, inventory, and view platform analytics</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Link to="/admin/orders" className="px-5 py-2.5 bg-dark text-white font-bold rounded-full text-sm hover:bg-primary transition-colors">
                        Manage Orders
                    </Link>
                    <Link to="/admin/inventory" className="px-5 py-2.5 bg-white text-dark border border-gray-200 font-bold rounded-full text-sm hover:bg-gray-50 transition-colors">
                        Inventory
                    </Link>
                    <Link to="/admin/pizzas" className="px-5 py-2.5 bg-white text-dark border border-gray-200 font-bold rounded-full text-sm hover:bg-gray-50 transition-colors">
                        Manage Pizzas
                    </Link>
                </div>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {widgets.map((w, idx) => (
                    <div
                        key={idx}
                        className={`p-6 rounded-2xl bg-gradient-to-br ${w.color} text-white shadow-sm flex justify-between items-center`}
                    >
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">{w.title}</span>
                            <h3 className="text-3xl font-extrabold mt-1">{w.value}</h3>
                        </div>
                        <span className="text-4xl opacity-80">{w.icon}</span>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-8 glass p-6 rounded-2xl shadow-sm">
                    <h3 className="text-xl font-bold text-dark mb-6">Recent Orders</h3>
                    {ordersData?.orders?.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">No orders placed yet</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {ordersData?.orders?.map((order) => (
                                <div
                                    key={order._id}
                                    className="p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-dark">Order #{order.orderNumber}</span>
                                            <span className="text-xs text-gray-400">• {new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Customer: {order.user?.name || 'Guest'} • Total: ₹{order.total}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatusMutation.mutate({ orderId: order._id, status: e.target.value })}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:border-primary"
                                        >
                                            {ADMIN_STATUSES.map((s) => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                        <Link
                                            to={`/orders/${order._id}`}
                                            className="px-3 py-1.5 bg-dark text-white rounded-lg text-xs font-bold hover:bg-primary transition-colors"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Stock Alerts */}
                <div className="lg:col-span-4 glass p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-dark">Low Stock Alerts</h3>
                    {lowStockData?.length === 0 ? (
                        <p className="text-sm text-green-600 font-medium text-center py-8">✓ All ingredients fully stocked</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {lowStockData?.map((item) => (
                                <div key={item._id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-sm text-amber-800">{item.name}</h4>
                                        <span className="text-xs text-amber-600">Qty: {item.quantity} {item.unit}</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-800 text-[10px] font-bold">
                                        Threshold: {item.threshold}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
