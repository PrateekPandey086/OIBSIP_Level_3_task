import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const onSubmit = async (data) => {
        try {
            const user = await login(data.email, data.password);
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate(from, { replace: true });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="glass max-w-md w-full p-8 rounded-2xl shadow-xl flex flex-col gap-6"
            >
                <div className="text-center">
                    <span className="text-5xl">🍕</span>
                    <h2 className="text-3xl font-extrabold text-dark mt-4">Welcome Back</h2>
                    <p className="text-gray-500 text-sm mt-1">Login to order your favorite pizza</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                            placeholder="you@example.com"
                        />
                        {errors.email && <span className="text-xs text-primary font-medium">{errors.email.message}</span>}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <Link to="/forgot-password" className="text-xs text-primary hover:underline font-semibold">
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            {...register('password', { required: 'Password is required' })}
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                            placeholder="••••••••"
                        />
                        {errors.password && <span className="text-xs text-primary font-medium">{errors.password.message}</span>}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary font-bold hover:underline">
                        Sign Up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
