import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
    const queryClient = useQueryClient();
    const [editingCoupon, setEditingCoupon] = useState(null);

    const { register, handleSubmit, reset, setValue } = useForm();

    // Fetch coupons
    const { data: couponsData, isLoading } = useQuery({
        queryKey: ['admin-coupons'],
        queryFn: async () => {
            const response = await api.get('/coupons');
            return response.data;
        },
    });

    // Create / Update coupon mutation
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            const couponData = {
                ...data,
                discount: parseInt(data.discount),
                minOrder: parseInt(data.minOrder),
                maxDiscount: parseInt(data.maxDiscount) || null,
                expiryDate: new Date(data.expiryDate),
            };

            if (editingCoupon) {
                await api.put(`/coupons/${editingCoupon._id}`, couponData);
            } else {
                await api.post('/coupons', couponData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
            toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created');
            reset();
            setEditingCoupon(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to save coupon');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/coupons/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
            toast.success('Coupon deleted');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete coupon');
        },
    });

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setValue('code', coupon.code);
        setValue('type', coupon.type);
        setValue('discount', coupon.discount);
        setValue('minOrder', coupon.minOrder);
        setValue('maxDiscount', coupon.maxDiscount || '');
        setValue('expiryDate', new Date(coupon.expiryDate).toISOString().split('T')[0]);
        setValue('description', coupon.description);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Coupons List */}
            <div className="lg:col-span-8 flex flex-col gap-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark">Coupon Management</h1>
                    <p className="text-gray-500 mt-1">Manage promotional offers and discount codes</p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2].map((n) => (
                            <div key={n} className="h-24 bg-gray-100 animate-pulse rounded-xl"></div>
                        ))}
                    </div>
                ) : !couponsData?.coupons || couponsData.coupons.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No coupons found</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {couponsData.coupons.map((coupon) => (
                            <div key={coupon._id} className="p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50">
                                <div>
                                    <h3 className="font-bold text-dark flex items-center gap-2">
                                        {coupon.code}
                                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
                                            {coupon.type}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        Expires: {new Date(coupon.expiryDate).toLocaleDateString()} • Min Order: ₹{coupon.minOrder}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(coupon)}
                                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteMutation.mutate(coupon._id)}
                                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column: Add / Edit Form */}
            <div className="lg:col-span-4">
                <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4 sticky top-24">
                    <h3 className="text-xl font-bold text-dark border-b border-gray-100 pb-3">
                        {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                    </h3>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">Coupon Code</label>
                        <input
                            type="text"
                            {...register('code', { required: true })}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50 uppercase"
                            placeholder="PIZZA20"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">Discount Type</label>
                        <select
                            {...register('type', { required: true })}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="flat">Flat Amount (₹)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-700">Discount Value</label>
                            <input
                                type="number"
                                {...register('discount', { required: true })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-700">Min Order (₹)</label>
                            <input
                                type="number"
                                {...register('minOrder', { required: true })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-700">Max Discount (₹)</label>
                            <input
                                type="number"
                                {...register('maxDiscount')}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                                placeholder="Optional"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-700">Expiry Date</label>
                            <input
                                type="date"
                                {...register('expiryDate', { required: true })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">Description</label>
                        <input
                            type="text"
                            {...register('description', { required: true })}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                            placeholder="Get 20% off up to ₹150"
                        />
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-red-600 shadow-md transition-all"
                        >
                            {editingCoupon ? 'Update Coupon' : 'Add Coupon'}
                        </button>
                        {editingCoupon && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingCoupon(null);
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

export default AdminCoupons;
