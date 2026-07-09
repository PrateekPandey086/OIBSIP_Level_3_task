import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // Fetch wishlist
    const { data: wishlistData, isLoading } = useQuery({
        queryKey: ['my-wishlist-page'],
        queryFn: async () => {
            const response = await api.get('/wishlist');
            return response.data.wishlist;
        },
    });

    // Remove from wishlist mutation
    const removeMutation = useMutation({
        mutationFn: async (pizzaId) => {
            await api.delete(`/wishlist/${pizzaId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-wishlist-page'] });
            toast.success('Removed from favorites');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to remove');
        },
    });

    const handleAddToCart = (pizza) => {
        addToCart({
            pizza: pizza._id,
            name: pizza.name,
            image: pizza.image,
            price: pizza.basePrice,
            size: 'medium',
            quantity: 1,
            isCustom: false,
        });
        navigate('/checkout');
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
            <div>
                <h1 className="text-4xl font-extrabold text-dark">My Favorites</h1>
                <p className="text-gray-500 mt-1">Your saved pizzas for quick ordering</p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-80 bg-gray-100 animate-pulse rounded-2xl"></div>
                    ))}
                </div>
            ) : !wishlistData?.pizzas || wishlistData.pizzas.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                    <span className="text-6xl">❤️</span>
                    <h3 className="text-2xl font-bold text-gray-700">No favorites saved yet</h3>
                    <p className="text-gray-500">Explore our menu and tap the heart icon to save pizzas here.</p>
                    <Link
                        to="/menu"
                        className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-red-600 transition-colors shadow-md"
                    >
                        Browse Menu
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {wishlistData.pizzas.map((pizza) => (
                        <motion.div
                            key={pizza._id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                        >
                            <div className="relative overflow-hidden h-56 bg-gray-100">
                                <img
                                    src={pizza.image}
                                    alt={pizza.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <button
                                    onClick={() => removeMutation.mutate(pizza._id)}
                                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-primary flex items-center justify-center shadow-md transition-colors"
                                >
                                    ❤️
                                </button>
                            </div>

                            <div className="p-6 flex flex-col gap-3 flex-grow">
                                <h3 className="text-lg font-bold text-dark">{pizza.name}</h3>
                                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                                    {pizza.description}
                                </p>

                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                                    <span className="text-xl font-extrabold text-dark">₹{pizza.basePrice}</span>
                                    <button
                                        onClick={() => handleAddToCart(pizza)}
                                        className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-red-600 shadow-md transition-all duration-300"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
