import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminCustomers = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    // Fetch customers
    const { data: customersData, isLoading } = useQuery({
        queryKey: ['admin-customers', search],
        queryFn: async () => {
            const response = await api.get('/users', {
                params: { search },
            });
            return response.data;
        },
    });

    // Toggle disable user mutation
    const toggleDisableMutation = useMutation({
        mutationFn: async (userId) => {
            await api.put(`/users/${userId}/toggle-disable`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
            toast.success('User status updated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update user status');
        },
    });

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark">Customer Management</h1>
                    <p className="text-gray-500 mt-1">View and manage registered platform users</p>
                </div>

                {/* Search Bar */}
                <div className="w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Search customers by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary bg-white/50 text-sm"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-20 bg-gray-100 animate-pulse rounded-xl"></div>
                    ))}
                </div>
            ) : !customersData?.users || customersData.users.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No customers found</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {customersData.users.map((customer) => (
                        <div
                            key={customer._id}
                            className="p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50"
                        >
                            <div>
                                <h3 className="font-bold text-dark flex items-center gap-2">
                                    {customer.name}
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${customer.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {customer.role}
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Email: {customer.email} • Phone: {customer.phone || 'N/A'}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${customer.isDisabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {customer.isDisabled ? 'Disabled' : 'Active'}
                                </span>
                                {customer.role !== 'admin' && (
                                    <button
                                        onClick={() => toggleDisableMutation.mutate(customer._id)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${customer.isDisabled
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                            }`}
                                    >
                                        {customer.isDisabled ? 'Enable' : 'Disable'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
