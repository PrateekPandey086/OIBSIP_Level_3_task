import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
    const featuredPizzas = [
        {
            name: 'Margherita Classica',
            price: '₹249',
            image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80',
            tag: 'Classic',
            rating: '4.8',
        },
        {
            name: 'Farmhouse Special',
            price: '₹349',
            image: 'https://images.unsplash.com/photo-1571066811602-716837d681de?auto=format&fit=crop&w=800&q=80',
            tag: 'Best Seller',
            rating: '4.6',
        },
        {
            name: 'Fiery Pepperoni',
            price: '₹449',
            image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
            tag: 'Spicy',
            rating: '4.9',
        },
    ];

    const steps = [
        { title: 'Choose', desc: 'Select from our curated signature pizzas or start from scratch.' },
        { title: 'Customize', desc: 'Pick your crust, sauce, cheese, and fresh gourmet toppings.' },
        { title: 'Checkout', desc: 'Secure payment with Razorpay. Fast and hassle-free.' },
        { title: 'Track', desc: 'Watch your pizza bake and travel in real-time via Socket.io.' },
        { title: 'Enjoy', desc: 'Delivered blazing hot at your doorstep, ready to devour.' },
    ];

    const testimonials = [
        { name: 'Aarav Mehta', role: 'Food Critic', text: 'The custom pizza builder is a game changer. The crust is perfectly crispy, and the toppings are incredibly fresh!' },
        { name: 'Riya Sharma', role: 'Pizza Lover', text: 'Blazing fast delivery! The real-time tracking is so accurate, and the pizza arrived steaming hot.' },
    ];

    const faqs = [
        { q: 'Can I customize any pizza?', a: 'Yes! You can customize any of our signature pizzas or build your own from scratch using our 5-step Pizza Builder.' },
        { q: 'How long does delivery take?', a: 'We deliver within 30-45 minutes. You can track the live status of your order on the tracking page.' },
        { q: 'Do you offer vegan options?', a: 'Absolutely! We offer vegan cheese and a wide variety of fresh vegetable toppings in our builder.' },
    ];

    return (
        <div className="relative overflow-hidden bg-cream min-h-screen">
            {/* Floating Ingredients Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <motion.span
                    animate={{ y: [0, -20, 0], rotate: [0, 360, 0] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-20 left-10 text-4xl opacity-20"
                >
                    🍅
                </motion.span>
                <motion.span
                    animate={{ y: [0, 20, 0], rotate: [0, -360, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute top-40 right-20 text-4xl opacity-20"
                >
                    🍄
                </motion.span>
                <motion.span
                    animate={{ y: [0, -15, 0], rotate: [0, 180, 0] }}
                    transition={{ duration: 7, repeat: Infinity }}
                    className="absolute bottom-40 left-1/4 text-4xl opacity-20"
                >
                    🍃
                </motion.span>
                <motion.span
                    animate={{ y: [0, 25, 0], rotate: [0, 360, 0] }}
                    transition={{ duration: 9, repeat: Infinity }}
                    className="absolute bottom-20 right-1/3 text-4xl opacity-20"
                >
                    🧀
                </motion.span>
            </div>

            {/* Hero Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col gap-6"
                >
                    <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs self-start tracking-wider uppercase">
                        Artisan Pizza Delivery
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-dark leading-tight tracking-tight">
                        Craft Your <br />
                        <span className="text-primary">Perfect Pizza</span>
                    </h1>
                    <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
                        Fresh ingredients. Handcrafted recipes. Delivered blazing hot. Experience the premium taste of artisan pizzas customized just the way you like.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2">
                        <Link
                            to="/menu"
                            className="px-8 py-4 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-red-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Order Now
                        </Link>
                        <Link
                            to="/builder"
                            className="px-8 py-4 bg-white text-dark border border-gray-200 font-bold rounded-full shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Explore Builder
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative flex justify-center"
                >
                    <div className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-primary/10 absolute -z-10 blur-3xl"></div>
                    <img
                        src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
                        alt="Premium Pizza"
                        className="w-full max-w-md rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
                    />
                </motion.div>
            </section>

            {/* Featured Pizzas */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-gray-100">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-dark">Featured Pizzas</h2>
                    <p className="text-gray-500 mt-2">Handcrafted favorites loved by our community</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredPizzas.map((pizza, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className="glass rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                        >
                            <div className="relative overflow-hidden h-64">
                                <img
                                    src={pizza.image}
                                    alt={pizza.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold shadow-md">
                                    {pizza.tag}
                                </span>
                            </div>
                            <div className="p-6 flex flex-col gap-4 flex-grow">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-dark">{pizza.name}</h3>
                                    <span className="text-sm font-bold text-primary flex items-center gap-1">
                                        ⭐ {pizza.rating}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                                    <span className="text-2xl font-extrabold text-dark">{pizza.price}</span>
                                    <Link
                                        to="/menu"
                                        className="px-4 py-2 rounded-full bg-dark text-white text-sm font-semibold hover:bg-primary transition-colors duration-300"
                                    >
                                        Order
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="relative z-10 bg-dark text-cream py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-white">How It Works</h2>
                        <p className="text-gray-400 mt-2">Five simple steps to pizza perfection</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className="flex flex-col items-center text-center gap-4 group"
                            >
                                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-extrabold shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    {idx + 1}
                                </div>
                                <h3 className="text-xl font-bold text-accent">{step.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="flex flex-col gap-6">
                        <h2 className="text-4xl font-extrabold text-dark">Why Choose Us?</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We are passionate about pizza. Every single order is crafted with love, using only the finest ingredients sourced locally.
                        </p>
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex gap-4 items-start">
                                <span className="text-3xl">🌿</span>
                                <div>
                                    <h4 className="font-bold text-lg">100% Fresh Ingredients</h4>
                                    <p className="text-gray-500 text-sm">No frozen dough, no artificial preservatives. Only fresh goodness.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <span className="text-3xl">⚡</span>
                                <div>
                                    <h4 className="font-bold text-lg">Blazing Fast Delivery</h4>
                                    <p className="text-gray-500 text-sm">Delivered hot and fresh within 45 minutes or it's free.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <img
                            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80"
                            alt="Artisan Chef"
                            className="rounded-3xl shadow-xl max-w-md w-full"
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="relative z-10 bg-primary/5 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-dark">What Our Customers Say</h2>
                        <p className="text-gray-500 mt-2">Real reviews from real pizza lovers</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {testimonials.map((t, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="glass p-8 rounded-2xl shadow-sm flex flex-col gap-4"
                            >
                                <p className="text-gray-600 italic">"{t.text}"</p>
                                <div>
                                    <h4 className="font-bold text-dark">{t.name}</h4>
                                    <span className="text-xs text-primary font-semibold">{t.role}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-dark">Frequently Asked Questions</h2>
                    <p className="text-gray-500 mt-2">Got questions? We've got answers.</p>
                </div>

                <div className="flex flex-col gap-6">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="glass p-6 rounded-xl shadow-sm">
                            <h4 className="font-bold text-lg text-dark mb-2">{faq.q}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Landing;
