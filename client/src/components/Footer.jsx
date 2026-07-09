import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }
        // Simulate subscription
        toast.success('Successfully subscribed to the newsletter! 🍕');
        setEmail('');
    };
    return (
        <footer className="bg-dark text-cream pt-16 pb-8 px-6 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                {/* Brand */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-2xl font-extrabold text-primary tracking-tight">
                        <span className="text-3xl">🍕</span>
                        <span>PizzaCraft</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Crafting the perfect artisan pizza with fresh, local ingredients. Delivered blazing hot to your doorstep.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-lg font-bold mb-4 text-accent">Explore</h4>
                    <ul className="flex flex-col gap-2 text-gray-400 text-sm">
                        <li><a href="/menu" className="hover:text-primary transition-colors">Our Menu</a></li>
                        <li><a href="/builder" className="hover:text-primary transition-colors">Pizza Builder</a></li>
                        <li><a href="/about" className="hover:text-primary transition-colors">Our Story</a></li>
                        <li><a href="/contact" className="hover:text-primary transition-colors">Contact Us</a></li>
                    </ul>
                </div>

                {/* Contact info */}
                <div>
                    <h4 className="text-lg font-bold mb-4 text-accent">Contact</h4>
                    <ul className="flex flex-col gap-2 text-gray-400 text-sm">
                        <li>123 Pizza Lane, Cheese Sector</li>
                        <li>Hapur, Uttar Pradesh 245201</li>
                        <li>Phone: +91 7078289406</li>
                        <li>Email: prateekpandey086@gmail.com</li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="text-lg font-bold mb-4 text-accent">Newsletter</h4>
                    <p className="text-gray-400 text-sm mb-4">Subscribe to get special offers and pizza news.</p>
                    <form className="flex gap-2" onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email"
                            className="px-4 py-2 rounded-lg bg-neutral-800 text-cream border border-neutral-700 focus:outline-none focus:border-primary text-sm w-full"
                        />
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold">
                            Join
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs">
                <p>&copy; {new Date().getFullYear()} PizzaCraft. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="/privacy" className="hover:text-cream transition-colors">Privacy Policy</a>
                    <a href="/terms" className="hover:text-cream transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
