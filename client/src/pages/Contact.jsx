import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all fields');
            return;
        }
        // Simulate sending message
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    return (
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col gap-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-3xl mx-auto"
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-dark mb-6">Contact Us</h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                    Have a question, feedback, or just want to say hi? We'd love to hear from you! Reach out to us using the details below or drop by our pizzeria.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-8 rounded-2xl shadow-sm flex flex-col gap-6"
                >
                    <h2 className="text-2xl font-bold text-dark">Get in Touch</h2>
                    <div className="flex flex-col gap-4 text-gray-600">
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">📍</span>
                            <div>
                                <h3 className="font-bold text-dark">Address</h3>
                                <p>123 Pizza Lane, Cheese Sector<br />Hapur, Uttar Pradesh 245201</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">📞</span>
                            <div>
                                <h3 className="font-bold text-dark">Phone</h3>
                                <p>+91 7078289406</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">✉️</span>
                            <div>
                                <h3 className="font-bold text-dark">Email</h3>
                                <p>prateekpandey086@gmail.com</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">🕒</span>
                            <div>
                                <h3 className="font-bold text-dark">Hours</h3>
                                <p>Mon-Sun: 10:00 AM - 11:00 PM</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass p-8 rounded-2xl shadow-sm"
                >
                    <h2 className="text-2xl font-bold text-dark mb-6">Send a Message</h2>
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                                placeholder="Your Email"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary h-32 resize-none"
                                placeholder="How can we help you?"
                            ></textarea>
                        </div>
                        <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-red-600 transition-colors mt-2">
                            Send Message
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
