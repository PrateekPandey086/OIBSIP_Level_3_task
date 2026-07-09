import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Real-time order status updates via Socket.io
    useEffect(() => {
        if (!user?._id) return;
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        const socket = io(socketUrl, { withCredentials: true });

        socket.on('connect', () => {
            socket.emit('join', user._id);
        });

        socket.on('orderStatusUpdate', (data) => {
            queryClient.invalidateQueries({ queryKey: ['my-recent-orders'] });
            toast.success(`🍕 Order status updated: ${data.status.replace(/-/g, ' ')}`, { duration: 4000 });
        });

        return () => socket.disconnect();
    }, [user?._id, queryClient]);

    // Fetch recent orders
    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['my-recent-orders'],
        queryFn: async () => {
            const response = await api.get('/orders/my-orders?limit=3');
            return response.data;
        },
    });

    // Fetch rewards
    const { data: rewardsData, isLoading: rewardsLoading } = useQuery({
        queryKey: ['my-rewards'],
        queryFn: async () => {
            const response = await api.get('/rewards');
            return response.data.reward;
        },
    });

    // Fetch wishlist
    const { data: wishlistData, isLoading: wishlistLoading } = useQuery({
        queryKey: ['my-wishlist'],
        queryFn: async () => {
            const response = await api.get('/wishlist');
            return response.data.wishlist;
        },
    });

    // Fetch notifications
    const { data: notificationsData } = useQuery({
        queryKey: ['my-notifications'],
        queryFn: async () => {
            const response = await api.get('/notifications');
            return response.data;
        },
    });

    const currentOrder = ordersData?.orders?.find(
        (o) => !['delivered', 'cancelled'].includes(o.status)
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark">Welcome back, {user.name}!</h1>
                    <p className="text-gray-500 mt-1">Here is what is cooking today</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/menu"
                        className="px-6 py-3 bg-primary text-white font-bold rounded-full shadow-md hover:bg-red-600 hover:shadow-lg transition-all duration-300"
                    >
                        Order Pizza
                    </Link>
                    <Link
                        to="/builder"
                        className="px-6 py-3 bg-white text-dark border border-gray-200 font-bold rounded-full shadow-md hover:bg-gray-50 transition-all duration-300"
                    >
                        Custom Builder
                    </Link>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Orders & Favorites */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Current Active Order */}
                    {currentOrder && (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass p-6 rounded-2xl border-l-4 border-l-primary shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                        >
                            <div className="flex flex-col gap-2">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs self-start uppercase tracking-wider">
                                    Active Order
                                </span>
                                <h3 className="text-xl font-bold text-dark">Order #{currentOrder.orderNumber}</h3>
                                <p className="text-sm text-gray-500">
                                    Status: <span className="font-semibold text-primary capitalize">{currentOrder.status.replace(/-/g, ' ')}</span>
                                </p>
                            </div>
                            <Link
                                to={`/orders/${currentOrder._id}`}
                                className="px-5 py-2.5 bg-dark text-white font-bold rounded-full text-sm hover:bg-primary transition-colors shadow-sm"
                            >
                                Track Live Status
                            </Link>
                        </motion.div>
                    )}

                    {/* Recent Orders */}
                    <div className="glass p-6 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-dark">Recent Orders</h3>
                            <Link to="/orders" className="text-sm text-primary font-bold hover:underline">
                                View All
                            </Link>
                        </div>

                        {ordersLoading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2].map((n) => (
                                    <div key={n} className="h-20 bg-gray-100 animate-pulse rounded-xl"></div>
                                ))}
                            </div>
                        ) : !ordersData?.orders || ordersData.orders.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center gap-3">
                                <span className="text-4xl">🍕</span>
                                <p className="text-gray-500">No orders placed yet.</p>
                                <Link to="/menu" className="text-primary font-bold hover:underline">
                                    Browse Menu
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {ordersData.orders.map((order) => (
                                    <div
                                        key={order._id}
                                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all gap-4"
                                    >
                                        <div>
                                            <h4 className="font-bold text-dark">Order #{order.orderNumber}</h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(order.createdAt).toLocaleDateString()} • ₹{order.total}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${order.status === 'delivered'
                                                ? 'bg-green-100 text-green-700'
                                                : order.status === 'cancelled'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status.replace(/-/g, ' ')}
                                            </span>
                                            <Link
                                                to={`/orders/${order._id}`}
                                                className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors"
                                            >
                                                Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Favorites / Wishlist */}
                    <div className="glass p-6 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-dark">My Favorites</h3>
                            <Link to="/wishlist" className="text-sm text-primary font-bold hover:underline">
                                Manage
                            </Link>
                        </div>

                        {wishlistLoading ? (
                            <div className="h-20 bg-gray-100 animate-pulse rounded-xl"></div>
                        ) : !wishlistData?.pizzas || wishlistData.pizzas.length === 0 ? (
                            <div className="text-center py-8 flex flex-col items-center gap-2">
                                <span className="text-3xl">❤️</span>
                                <p className="text-gray-500 text-sm">No favorite pizzas saved yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {wishlistData.pizzas.slice(0, 2).map((pizza) => (
                                    <div
                                        key={pizza._id}
                                        className="flex gap-4 p-3 rounded-xl border border-gray-100 items-center"
                                    >
                                        <img src={pizza.image} alt={pizza.name} className="w-16 h-16 object-cover rounded-lg" />
                                        <div>
                                            <h4 className="font-bold text-sm text-dark">{pizza.name}</h4>
                                            <span className="text-xs text-primary font-bold">₹{pizza.basePrice}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Rewards & Notifications */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    {/* Reward Points Card */}
                    <div className="glass p-6 rounded-2xl shadow-sm bg-gradient-to-br from-primary to-red-600 text-white flex flex-col gap-6 relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 pointer-events-none">🍕</div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-85">Reward Points</span>
                            <h3 className="text-4xl font-extrabold mt-1">{rewardsData?.points || 0}</h3>
                            <p className="text-xs opacity-75 mt-1">10 points = ₹1 discount</p>
                        </div>

                        <div className="border-t border-white/20 pt-4">
                            <h4 className="font-bold text-sm mb-2">Milestones</h4>
                            <div className="flex flex-col gap-2">
                                {rewardsData?.milestones?.slice(0, 2).map((m, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="opacity-90">{m.name}</span>
                                        <span className={`px-2 py-0.5 rounded-full font-bold ${m.achieved ? 'bg-white/20 text-white' : 'bg-black/20 text-white/60'}`}>
                                            {m.achieved ? 'Unlocked' : 'Locked'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-dark">Notifications</h3>
                        {notificationsData?.notifications?.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-6">No new notifications</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {notificationsData?.notifications?.slice(0, 4).map((n) => (
                                    <div key={n._id} className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50/50 text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-dark">{n.title}</span>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 leading-relaxed">{n.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
