import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminInventory = () => {
    const queryClient = useQueryClient();
    const [categoryFilter, setCategoryFilter] = useState('');
    const [editingItem, setEditingItem] = useState(null);

    const { register, handleSubmit, reset, setValue } = useForm();

    // Fetch inventory
    const { data: inventoryData, isLoading } = useQuery({
        queryKey: ['admin-inventory', categoryFilter],
        queryFn: async () => {
            const url = categoryFilter ? `/inventory/category/${categoryFilter}` : '/inventory';
            const response = await api.get(url);
            return response.data;
        },
    });

    // Create / Update inventory item mutation
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (editingItem) {
                await api.put(`/inventory/${editingItem._id}`, data);
            } else {
                await api.post('/inventory', data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
            toast.success(editingItem ? 'Item updated' : 'Item created');
            reset();
            setEditingItem(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to save item');
        },
    });

    // Update stock quantity mutation
    const updateStockMutation = useMutation({
        mutationFn: async ({ id, delta, action }) => {
            await api.put(`/inventory/${id}/stock`, {
                quantity: Math.abs(delta),
                action,
                reason: 'Manual adjustment',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
            toast.success('Stock updated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update stock');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/inventory/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
            toast.success('Item deleted');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete item');
        },
    });

    const handleEdit = (item) => {
        setEditingItem(item);
        setValue('name', item.name);
        setValue('category', item.category);
        setValue('quantity', item.quantity);
        setValue('threshold', item.threshold);
        setValue('unit', item.unit);
        setValue('price', item.price);
    };

    const onSubmit = (data) => {
        saveMutation.mutate(data);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Inventory List */}
            <div className="lg:col-span-8 flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-dark">Inventory Management</h1>
                        <p className="text-gray-500 mt-1">Track and manage pizza ingredients and stock levels</p>
                    </div>

                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary"
                    >
                        <option value="">All Categories</option>
                        <option value="base">Bases</option>
                        <option value="sauce">Sauces</option>
                        <option value="cheese">Cheese</option>
                        <option value="veggie">Veggies</option>
                        <option value="meat">Meats</option>
                        <option value="extra">Extras</option>
                    </select>
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-20 bg-gray-100 animate-pulse rounded-xl"></div>
                        ))}
                    </div>
                ) : !inventoryData?.items || inventoryData.items.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No inventory items found</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {inventoryData.items.map((item) => {
                            const isLowStock = item.quantity <= item.threshold;
                            return (
                                <div
                                    key={item._id}
                                    className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 transition-all ${isLowStock ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'
                                        }`}
                                >
                                    <div>
                                        <h3 className="font-bold text-dark flex items-center gap-2">
                                            {item.name}
                                            {isLowStock && (
                                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                                                    Low Stock
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 capitalize">
                                            Category: {item.category} • Price: ₹{item.price} per {item.unit}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateStockMutation.mutate({ id: item._id, delta: 10, action: 'deduct' })}
                                                disabled={updateStockMutation.isPending}
                                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center font-bold hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="text-sm font-bold text-dark w-16 text-center">
                                                {item.quantity} {item.unit}
                                            </span>
                                            <button
                                                onClick={() => updateStockMutation.mutate({ id: item._id, delta: 10, action: 'add' })}
                                                disabled={updateStockMutation.isPending}
                                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center font-bold hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteMutation.mutate(item._id)}
                                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Right Column: Add / Edit Form */}
            <div className="lg:col-span-4">
                <form onSubmit={handleSubmit(onSubmit)} className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4 sticky top-24">
                    <h3 className="text-xl font-bold text-dark border-b border-gray-100 pb-3">
                        {editingItem ? 'Edit Item' : 'Add New Item'}
                    </h3>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">Item Name</label>
                        <input
                            type="text"
                            {...register('name', { required: true })}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                            placeholder="Mozzarella Cheese"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">Category</label>
                        <select
                            {...register('category', { required: true })}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                        >
                            <option value="base">Base</option>
                            <option value="sauce">Sauce</option>
                            <option value="cheese">Cheese</option>
                            <option value="veggie">Veggie</option>
                            <option value="meat">Meat</option>
                            <option value="extra">Extra</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-700">Quantity</label>
                            <input
                                type="number"
                                {...register('quantity', { required: true, valueAsNumber: true })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-700">Threshold</label>
                            <input
                                type="number"
                                {...register('threshold', { required: true, valueAsNumber: true })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-700">Unit</label>
                            <input
                                type="text"
                                {...register('unit', { required: true })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                                placeholder="grams, pieces"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-700">Price (₹)</label>
                            <input
                                type="number"
                                {...register('price', { required: true, valueAsNumber: true })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-red-600 shadow-md transition-all"
                        >
                            {editingItem ? 'Update Item' : 'Add Item'}
                        </button>
                        {editingItem && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingItem(null);
                                    reset();
                                }}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminInventory;
