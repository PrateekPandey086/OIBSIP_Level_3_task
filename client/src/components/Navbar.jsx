import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="glass sticky top-0 z-50 px-6 py-4 shadow-sm">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-primary tracking-tight">
                    <span className="text-3xl">🍕</span>
                    <span>PizzaCraft</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 font-medium">
                    <Link to="/menu" className="hover:text-primary transition-colors">Menu</Link>
                    <Link to="/builder" className="hover:text-primary transition-colors">Pizza Builder</Link>
                    {isAuthenticated && (
                        <>
                            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                            {isAdmin && (
                                <Link to="/admin" className="text-accent hover:text-primary transition-colors font-semibold">Admin Panel</Link>
                            )}
                        </>
                    )}
                    {/* Cart Link */}
                    <Link to="/checkout" className="relative p-2 text-gray-700 hover:text-primary transition-colors flex items-center">
                        <span className="text-xl">🛒</span>
                        {cartItemsCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                {cartItemsCount}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Desktop Auth / Profile */}
                <div className="hidden md:flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Hi, {user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-full text-sm font-semibold border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
                                Login
                            </Link>
                            <Link to="/register" className="px-5 py-2 rounded-full text-sm font-semibold bg-primary text-white hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-300">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Hamburger Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-gray-700 hover:text-primary focus:outline-none"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden mt-4 border-t border-gray-100 pt-4 flex flex-col gap-4 font-medium"
                    >
                        <Link to="/menu" onClick={() => setIsOpen(false)} className="hover:text-primary py-2 transition-colors">Menu</Link>
                        <Link to="/builder" onClick={() => setIsOpen(false)} className="hover:text-primary py-2 transition-colors">Pizza Builder</Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="hover:text-primary py-2 transition-colors">Dashboard</Link>
                                {isAdmin && (
                                    <Link to="/admin" onClick={() => setIsOpen(false)} className="text-accent hover:text-primary py-2 transition-colors font-semibold">Admin Panel</Link>
                                )}
                            </>
                        )}
                        {/* Mobile Cart Link */}
                        <Link to="/checkout" onClick={() => setIsOpen(false)} className="hover:text-primary py-2 transition-colors flex items-center gap-2">
                            <span>🛒 Cart</span>
                            {cartItemsCount > 0 && (
                                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {cartItemsCount} items
                                </span>
                            )}
                        </Link>
                        <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full py-2 rounded-full text-center font-semibold border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                                >
                                    Logout
                                </button>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="w-full py-2 text-center font-semibold text-gray-700 hover:text-primary transition-colors">
                                        Login
                                    </Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="w-full py-2 rounded-full text-center font-semibold bg-primary text-white hover:bg-red-600 transition-all duration-300">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
