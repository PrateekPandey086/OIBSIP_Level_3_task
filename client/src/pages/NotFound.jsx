import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md flex flex-col items-center gap-6"
            >
                <span className="text-8xl">🍕</span>
                <h1 className="text-4xl font-extrabold text-primary">404 - Pizza Lost!</h1>
                <p className="text-gray-600">
                    The page you are looking for has been eaten, or it never existed. Let's get you back to the kitchen.
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

export default NotFound;
