import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    const { register: profileReg, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
        defaultValues: {
            name: user?.name || '',
            phone: user?.phone || '',
        },
    });

    const { register: passwordReg, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPasswordForm } = useForm();

    const onProfileSubmit = async (data) => {
        setLoading(true);
        try {
            await updateProfile(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onPasswordSubmit = async (data) => {
        setLoading(true);
        try {
            await api.put('/users/password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            toast.success('Password updated successfully');
            resetPasswordForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Profile & Password */}
            <div className="lg:col-span-8 flex flex-col gap-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark">My Profile</h1>
                    <p className="text-gray-500 mt-1">Manage your account details and security settings</p>
                </div>

                {/* Edit Profile Form */}
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="glass p-8 rounded-2xl shadow-sm flex flex-col gap-6">
                    <h3 className="text-xl font-bold text-dark border-b border-gray-100 pb-3">Profile Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Full Name</label>
                            <input
                                type="text"
                                {...profileReg('name', { required: 'Name is required' })}
                                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                            />
                            {profileErrors.name && <span className="text-xs text-primary font-medium">{profileErrors.name.message}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                {...profileReg('phone', {
                                    required: 'Phone number is required',
                                    pattern: { value: /^[0-9]{10}$/, message: 'Invalid 10-digit phone number' },
                                })}
                                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                            />
                            {profileErrors.phone && <span className="text-xs text-primary font-medium">{profileErrors.phone.message}</span>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Email Address (Cannot be changed)</label>
                        <input
                            type="email"
                            disabled
                            value={user?.email || ''}
                            className="px-4 py-3 rounded-xl border border-gray-200 text-sm w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-red-600 shadow-md transition-all duration-300 self-start disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                {/* Change Password Form */}
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="glass p-8 rounded-2xl shadow-sm flex flex-col gap-6">
                    <h3 className="text-xl font-bold text-dark border-b border-gray-100 pb-3">Security & Password</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Current Password</label>
                            <input
                                type="password"
                                {...passwordReg('currentPassword', { required: 'Current password is required' })}
                                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                                placeholder="••••••••"
                            />
                            {passwordErrors.currentPassword && <span className="text-xs text-primary font-medium">{passwordErrors.currentPassword.message}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">New Password</label>
                            <input
                                type="password"
                                {...passwordReg('newPassword', {
                                    required: 'New password is required',
                                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                })}
                                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                                placeholder="••••••••"
                            />
                            {passwordErrors.newPassword && <span className="text-xs text-primary font-medium">{passwordErrors.newPassword.message}</span>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 rounded-xl bg-dark text-white font-bold hover:bg-primary transition-all duration-300 self-start disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>

            {/* Right Column: Addresses list */}
            <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-dark border-b border-gray-100 pb-3">My Addresses</h3>
                    {user?.addresses?.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">No addresses saved yet</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {user?.addresses?.map((addr, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-gray-100 flex flex-col gap-1 bg-white/50">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-sm text-dark">{addr.label}</span>
                                        {addr.isDefault && (
                                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
