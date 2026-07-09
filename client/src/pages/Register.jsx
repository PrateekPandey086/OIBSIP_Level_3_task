import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const { register: signUp, loading } = useAuth();
    const navigate = useNavigate();

    const password = watch('password');

    const onSubmit = async (data) => {
        try {
            await signUp(data.name, data.email, data.password, data.phone);
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-6 py-12">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="glass max-w-md w-full p-8 rounded-2xl shadow-xl flex flex-col gap-6"
            >
                <div className="text-center">
                    <span className="text-5xl">🍕</span>
                    <h2 className="text-3xl font-extrabold text-dark mt-4">Create Account</h2>
                    <p className="text-gray-500 text-sm mt-1">Join PizzaCraft and craft your perfect pizza</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Full Name</label>
                        <input
                            type="text"
                            {...register('name', { required: 'Name is required' })}
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                            placeholder="John Doe"
                        />
                        {errors.name && <span className="text-xs text-primary font-medium">{errors.name.message}</span>}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Email Address</label>
                        <input
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                            })}
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                            placeholder="john@example.com"
                        />
                        {errors.email && <span className="text-xs text-primary font-medium">{errors.email.message}</span>}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            {...register('phone', {
                                required: 'Phone number is required',
                                pattern: { value: /^[0-9]{10}$/, message: 'Invalid 10-digit phone number' },
                            })}
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                            placeholder="9876543210"
                        />
                        {errors.phone && <span className="text-xs text-primary font-medium">{errors.phone.message}</span>}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Password</label>
                        <input
                            type="password"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Password must be at least 6 characters' },
                            })}
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                            placeholder="••••••••"
                        />
                        {errors.password && <span className="text-xs text-primary font-medium">{errors.password.message}</span>}
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (value) => value === password || 'Passwords do not match',
                            })}
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                            placeholder="••••••••"
                        />
                        {errors.confirmPassword && <span className="text-xs text-primary font-medium">{errors.confirmPassword.message}</span>}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
