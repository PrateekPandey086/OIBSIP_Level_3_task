import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: data.email });
            setSubmitted(true);
            toast.success('Password reset link sent to your email');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="glass max-w-md w-full p-8 rounded-2xl shadow-xl flex flex-col gap-6"
            >
                <div className="text-center">
                    <span className="text-5xl">🔑</span>
                    <h2 className="text-3xl font-extrabold text-dark mt-4">Forgot Password</h2>
                    <p className="text-gray-500 text-sm mt-1">Enter your email to receive a password reset link</p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Email Address</label>
                            <input
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                                })}
                                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                                placeholder="you@example.com"
                            />
                            {errors.email && <span className="text-xs text-primary font-medium">{errors.email.message}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 mt-2"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center flex flex-col gap-4">
                        <p className="text-gray-600">
                            We have sent a password reset link to your email address. Please check your inbox and spam folder.
                        </p>
                        <Link
                            to="/login"
                            className="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-red-600 transition-all duration-300"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}

                {!submitted && (
                    <p className="text-center text-sm text-gray-600">
                        Remembered your password?{' '}
                        <Link to="/login" className="text-primary font-bold hover:underline">
                            Login
                        </Link>
                    </p>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
