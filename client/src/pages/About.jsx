import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col gap-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-3xl mx-auto"
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-dark mb-6">Our Story</h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                    Welcome to PizzaCraft! We started with a simple idea: to craft the perfect artisan pizza using only the freshest, locally sourced ingredients. What began as a small passion project in a home kitchen has grown into a beloved local pizzeria, dedicated to bringing people together over great food.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
                        alt="Pizza making process"
                        className="rounded-2xl shadow-xl w-full h-auto object-cover"
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col gap-6"
                >
                    <h2 className="text-3xl font-bold text-dark">The Art of Dough</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Our dough is made fresh daily, fermented for 48 hours to develop that signature complex flavor and airy crust. We believe that a great pizza starts with a great foundation, and we never compromise on quality.
                    </p>
                    <h2 className="text-3xl font-bold text-dark mt-4">Fresh Ingredients</h2>
                    <p className="text-gray-600 leading-relaxed">
                        From our vine-ripened tomato sauce to our hand-pulled mozzarella, every ingredient is carefully selected. We partner with local farmers to ensure that only the best produce makes it onto your pizza.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
