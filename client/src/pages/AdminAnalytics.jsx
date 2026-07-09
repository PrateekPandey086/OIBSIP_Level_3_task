import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { motion } from 'framer-motion';

const AdminAnalytics = () => {
    // Fetch revenue analytics
    const { data: revenueData, isLoading: revenueLoading } = useQuery({
        queryKey: ['admin-analytics-revenue'],
        queryFn: async () => {
            const response = await api.get('/analytics/revenue');
            return response.data;
        },
    });

    // Fetch popular pizzas
    const { data: popularData, isLoading: popularLoading } = useQuery({
        queryKey: ['admin-analytics-popular'],
        queryFn: async () => {
            const response = await api.get('/analytics/popular-pizzas');
            return response.data.popularPizzas;
        },
    });

    // Fetch peak hours
    const { data: peakHoursData, isLoading: peakHoursLoading } = useQuery({
        queryKey: ['admin-analytics-peak'],
        queryFn: async () => {
            const response = await api.get('/analytics/peak-hours');
            return response.data.peakHours;
        },
    });

    if (revenueLoading || popularLoading || peakHoursLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-cream">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-primary font-semibold">Loading analytics...</p>
                </div>
            </div>
        );
    }

    // Mock data if backend returns empty arrays for new DB
    const revenueStats = revenueData?.revenue?.length > 0 ? revenueData.revenue : [
        { _id: 'Mon', total: 1200 },
        { _id: 'Tue', total: 1900 },
        { _id: 'Wed', total: 1500 },
        { _id: 'Thu', total: 2500 },
        { _id: 'Fri', total: 3200 },
        { _id: 'Sat', total: 4500 },
        { _id: 'Sun', total: 4000 },
    ];

    const popularPizzas = popularData?.length > 0 ? popularData : [
        { name: 'Margherita Classica', count: 45 },
        { name: 'Fiery Pepperoni', count: 38 },
        { name: 'Farmhouse Special', count: 30 },
        { name: 'Paneer Tikka Butter', count: 25 },
    ];

    const peakHours = peakHoursData?.length > 0 ? peakHoursData : [
        { _id: 12, count: 15 },
        { _id: 13, count: 18 },
        { _id: 18, count: 22 },
        { _id: 19, count: 35 },
        { _id: 20, count: 40 },
        { _id: 21, count: 28 },
    ];

    // SVG Chart Calculations
    const maxRevenue = Math.max(...revenueStats.map((d) => d.total));
    const maxPopular = Math.max(...popularPizzas.map((d) => d.count));
    const maxPeak = Math.max(...peakHours.map((d) => d.count));

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
            <div>
                <h1 className="text-4xl font-extrabold text-dark">Analytics & Reports</h1>
                <p className="text-gray-500 mt-1">Platform performance, sales trends, and popular products</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weekly Revenue Chart */}
                <div className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-dark">Weekly Revenue (₹)</h3>
                    <div className="h-64 w-full flex items-end justify-between gap-2 pt-6 border-b border-l border-gray-200 px-4">
                        {revenueStats.map((d, idx) => {
                            const heightPercent = maxRevenue > 0 ? (d.total / maxRevenue) * 80 : 0;
                            return (
                                <div key={idx} className="flex flex-col items-center flex-grow group">
                                    <span className="text-[10px] text-gray-500 font-semibold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        ₹{d.total}
                                    </span>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercent}%` }}
                                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                                        className="w-full max-w-[40px] bg-primary rounded-t-lg group-hover:bg-red-600 transition-colors"
                                    />
                                    <span className="text-xs text-gray-600 mt-2 font-medium">{d._id}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Popular Pizzas Chart */}
                <div className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-dark">Popular Pizzas (Sales Count)</h3>
                    <div className="flex flex-col gap-4 pt-4">
                        {popularPizzas.map((d, idx) => {
                            const widthPercent = maxPopular > 0 ? (d.count / maxPopular) * 100 : 0;
                            return (
                                <div key={idx} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                                        <span>{d.name || d.pizzaDetails?.name}</span>
                                        <span>{d.count} sales</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${widthPercent}%` }}
                                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                                            className="h-full bg-accent rounded-full"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Peak Ordering Hours */}
                <div className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4 lg:col-span-2">
                    <h3 className="text-lg font-bold text-dark">Peak Ordering Hours (24h Format)</h3>
                    <div className="h-64 w-full flex items-end justify-between gap-2 pt-6 border-b border-l border-gray-200 px-4">
                        {peakHours.map((d, idx) => {
                            const heightPercent = maxPeak > 0 ? (d.count / maxPeak) * 80 : 0;
                            return (
                                <div key={idx} className="flex flex-col items-center flex-grow group">
                                    <span className="text-[10px] text-gray-500 font-semibold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {d.count} orders
                                    </span>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercent}%` }}
                                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                                        className="w-full max-w-[50px] bg-indigo-500 rounded-t-lg group-hover:bg-indigo-600 transition-colors"
                                    />
                                    <span className="text-xs text-gray-600 mt-2 font-medium">{d._id}:00</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
