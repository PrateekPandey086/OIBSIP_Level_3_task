import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Unauthorized = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md flex flex-col items-center gap-6"
            >
                <span className="text-8xl">🚫</span>
                <h1 className="text-4xl font-extrabold text-primary">403 - Access Denied</h1>
                <p className="text-gray-600">
                    You do not have permission to view this page. Please contact the administrator if you think this is a mistake.
                </p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-primary text-white font-semibold rounded-full shadow-md hover:bg-red-600 hover:shadow-lg transition-all duration-300"
                >
                    Back to Home
                </Link>
            </motion.div>
        </div>
    );
};

export default Unauthorized;
