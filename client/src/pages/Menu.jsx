import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Menu = () => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [isVeg, setIsVeg] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [page, setPage] = useState(1);

    const navigate = useNavigate();
    const { addToCart } = useCart();

    // Fetch pizzas
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['pizzas', { search, category, isVeg, sort, page }],
        queryFn: async () => {
            const response = await api.get('/pizzas', {
                params: { search, category, isVeg, sort, page, limit: 9 },
            });
            return response.data;
        },
    });

    useEffect(() => {
        refetch();
    }, [search, category, isVeg, sort, page]);

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
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark">Our Menu</h1>
                    <p className="text-gray-500 mt-1">Freshly baked artisan pizzas crafted to perfection</p>
                </div>

                {/* Search Bar */}
                <div className="w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Search pizzas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary bg-white/50 text-sm"
                    />
                </div>
            </div>

            {/* Filters & Sorting */}
            <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                    {/* Category Filter */}
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary"
                    >
                        <option value="">All Categories</option>
                        <option value="classic">Classic</option>
                        <option value="veg">Veg Delight</option>
                        <option value="non-veg">Non-Veg Supreme</option>
                        <option value="premium">Premium Gourmet</option>
                        <option value="special">Chef Specials</option>
                    </select>

                    {/* Veg/Non-Veg Filter */}
                    <select
                        value={isVeg}
                        onChange={(e) => setIsVeg(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary"
                    >
                        <option value="">All Types</option>
                        <option value="true">Veg Only</option>
                        <option value="false">Non-Veg Only</option>
                    </select>
                </div>

                {/* Sorting */}
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary"
                >
                    <option value="-createdAt">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="popular">Most Popular</option>
                </select>
            </div>

            {/* Pizza Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="glass rounded-2xl h-96 animate-pulse bg-gray-200/50"></div>
                    ))}
                </div>
            ) : data?.pizzas?.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                    <span className="text-6xl">🍕</span>
                    <h3 className="text-2xl font-bold text-gray-700">No pizzas found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data?.pizzas?.map((pizza) => (
                            <motion.div
                                key={pizza._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="glass rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                            >
                                <div className="relative overflow-hidden h-56 bg-gray-100">
                                    <img
                                        src={pizza.image}
                                        alt={pizza.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-white text-xs font-bold shadow-md ${pizza.isVeg ? 'bg-green-600' : 'bg-red-600'}`}>
                                            {pizza.isVeg ? 'Veg' : 'Non-Veg'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col gap-3 flex-grow">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-dark group-hover:text-primary transition-colors">
                                            {pizza.name}
                                        </h3>
                                        <span className="text-sm font-bold text-primary flex items-center gap-1">
                                            ⭐ {pizza.rating}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                                        {pizza.description}
                                    </p>

                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {pizza.ingredients.slice(0, 4).map((ing, i) => (
                                            <span key={i} className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium">
                                                {ing}
                                            </span>
                                        ))}
                                        {pizza.ingredients.length > 4 && (
                                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium">
                                                +{pizza.ingredients.length - 4} more
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                                        <span className="text-xl font-extrabold text-dark">₹{pizza.basePrice}</span>
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/builder?pizzaId=${pizza._id}`}
                                                className="px-3.5 py-2 rounded-full border border-gray-200 text-xs font-bold hover:bg-gray-50 transition-colors"
                                            >
                                                Customize
                                            </Link>
                                            <button
                                                onClick={() => handleAddToCart(pizza)}
                                                className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-300"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {data?.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-12">
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
                </>
            )}
        </div>
    );
};

export default Menu;
