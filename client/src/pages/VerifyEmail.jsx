import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await api.get(`/auth/verify-email/${token}`);
                setStatus('success');
                setMessage(response.data.message);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="glass max-w-md w-full p-8 rounded-2xl shadow-xl text-center flex flex-col gap-6"
            >
                {status === 'verifying' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <h2 className="text-2xl font-bold">Verifying Email</h2>
                        <p className="text-gray-500">Please wait while we confirm your email address...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-6xl">✅</span>
                        <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
                        <p className="text-gray-600">{message || 'Your email has been verified successfully. You can now order pizzas!'}</p>
                        <Link
                            to="/login"
                            className="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-red-600 transition-all duration-300 w-full"
                        >
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-6xl">❌</span>
                        <h2 className="text-2xl font-bold text-primary">Verification Failed</h2>
                        <p className="text-gray-600">{message || 'The verification link is invalid or has expired.'}</p>
                        <Link
                            to="/register"
                            className="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-red-600 transition-all duration-300 w-full"
                        >
                            Try Registering Again
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
