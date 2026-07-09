import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    const { token } = useParams();
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const password = watch('password');

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await api.post(`/auth/reset-password/${token}`, { password: data.password });
            toast.success('Password reset successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
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
                    <span className="text-5xl">🔒</span>
                    <h2 className="text-3xl font-extrabold text-dark mt-4">Reset Password</h2>
                    <p className="text-gray-500 text-sm mt-1">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">New Password</label>
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
                        <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
