import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch current user on mount
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get('/auth/me');
                setUser(response.data.user);
            } catch (error) {
                console.error('Failed to load user:', error);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    // Register
    const register = async (name, email, password, phone) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/register', { name, email, password, phone });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            setUser(userData);
            toast.success('Registration successful! Please verify your email.');
            return userData;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Login
    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            setUser(userData);
            toast.success(`Welcome back, ${userData.name}!`);
            return userData;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        setLoading(true);
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
            toast.success('Logged out successfully');
        }
    };

    // Update Profile
    const updateProfile = async (profileData) => {
        try {
            const response = await api.put('/users/profile', profileData);
            setUser(response.data.user);
            toast.success('Profile updated successfully');
            return response.data.user;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile, isAuthenticated: !!user, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
