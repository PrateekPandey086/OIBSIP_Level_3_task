import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminPizzas = () => {
    const queryClient = useQueryClient();
    const [editingPizza, setEditingPizza] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const { register, handleSubmit, reset, setValue } = useForm();

    // Fetch pizzas
    const { data: pizzasData, isLoading } = useQuery({
        queryKey: ['admin-pizzas'],
        queryFn: async () => {
            const response = await api.get('/pizzas?limit=100');
            return response.data;
        },
    });

    // Create / Update pizza mutation
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            let imageUrl = editingPizza?.image || '';

            // Upload image if selected
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                const uploadResponse = await api.post('/pizzas/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                imageUrl = uploadResponse.data.url;
            }

            const pizzaData = {
                ...data,
                image: imageUrl,
                ingredients: data.ingredients.split(',').map((i) => i.trim()),
                sizes: {
                    small: 0,
                    medium: parseInt(data.mediumPriceOffset) || 100,
                    large: parseInt(data.largePriceOffset) || 200,
                },
            };

            if (editingPizza) {
                await api.put(`/pizzas/${editingPizza._id}`, pizzaData);
            } else {
                await api.post('/pizzas', pizzaData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pizzas'] });
            toast.success(editingPizza ? 'Pizza updated' : 'Pizza created');
            reset();
            setEditingPizza(null);
            setImageFile(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to save pizza');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/pizzas/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pizzas'] });
            toast.success('Pizza deleted');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete pizza');
        },
    });

    const handleEdit = (pizza) => {
        setEditingPizza(pizza);
        setValue('name', pizza.name);
        setValue('description', pizza.description);
        setValue('category', pizza.category);
        setValue('basePrice', pizza.basePrice);
        setValue('ingredients', pizza.ingredients.join(', '));
        setValue('calories', pizza.calories);
        setValue('cookTime', pizza.cookTime);
        setValue('isVeg', pizza.isVeg);
        setValue('isFeatured', pizza.isFeatured);
        setValue('mediumPriceOffset', pizza.sizes?.medium || 100);
        setValue('largePriceOffset', pizza.sizes?.large || 200);
    };

    const onSubmit = (data) => {
        saveMutation.mutate(data);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Pizzas List */}
            <div className="lg:col-span-8 flex flex-col gap-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark">Pizza Management</h1>
                    <p className="text-gray-500 mt-1">Manage catalog pizzas, pricing, and availability</p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map((n) => (
                            <div key={n} className="h-48 bg-gray-100 animate-pulse rounded-2xl"></div>
                        ))}
                    </div>
                ) : !pizzasData?.pizzas || pizzasData.pizzas.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No pizzas found</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pizzasData.pizzas.map((pizza) => (
                            <div key={pizza._id} className="glass rounded-2xl overflow-hidden shadow-sm flex flex-col bg-white/50">
                                <img src={pizza.image} alt={pizza.name} className="h-40 w-full object-cover" />
                                <div className="p-4 flex flex-col gap-2 flex-grow">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-dark">{pizza.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pizza.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {pizza.isVeg ? 'Veg' : 'Non-Veg'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">{pizza.description}</p>
                                    <span className="text-lg font-extrabold text-dark mt-2">₹{pizza.basePrice}</span>

                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleEdit(pizza)}
                                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 flex-grow"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteMutation.mutate(pizza._id)}
                                            className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors flex-grow"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column: Add / Edit Form */}
            <div className="lg:col-span-4">
                <form onSubmit={handleSubmit(onSubmit)} className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4 sticky top-24 max-h-[80vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-dark border-b border-gray-100 pb-3">
                        {editingPizza ? 'Edit Pizza' : 'Add New Pizza'}
                    </h3>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">Pizza Name</label>
                        <input
                            type="text"
                            {...register('name', { required: true })}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                            placeholder="Peppy Paneer"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">Description</label>
                        <textarea
                            {...register('description', { required: true })}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50 h-20 resize-none"
                            placeholder="Flavorful paneer chunks with capsicum..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-700">Category</label>
                            <select
                                {...register('category', { required: true })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                            >
                                <option value="classic">Classic</option>
                                <option value="veg">Veg</option>
                                <option value="non-veg">Non-Veg</option>
                                <option value="premium">Premium</option>
                                <option value="special">Special</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-700">Base Price (₹)</label>
                            <input
                                type="number"
                                {...register('basePrice', { required: true, valueAsNumber: true })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">Ingredients (Comma separated)</label>
                        <input
                            type="text"
                            {...register('ingredients', { required: true })}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                            placeholder="Tomato Sauce, Mozzarella, Paneer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-700">Calories</label>
                            <input
                                type="number"
                                {...register('calories', { required: true, valueAsNumber: true })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-700">Cook Time</label>
                            <input
                                type="text"
                                {...register('cookTime', { required: true })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-full bg-white/50"
                                placeholder="15-20 min"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" {...register('isVeg')} id="isVeg" />
                            <label htmlFor="isVeg" className="text-xs font-semibold text-gray-700">Is Veg</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" {...register('isFeatured')} id="isFeatured" />
                            <label htmlFor="isFeatured" className="text-xs font-semibold text-gray-700">Is Featured</label>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">Pizza Image</label>
                        <input
                            type="file"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className="text-xs"
                            accept="image/*"
                        />
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-red-600 shadow-md transition-all"
                        >
                            {editingPizza ? 'Update Pizza' : 'Add Pizza'}
                        </button>
                        {editingPizza && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingPizza(null);
                                    reset();
                                    setImageFile(null);
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

export default AdminPizzas;
