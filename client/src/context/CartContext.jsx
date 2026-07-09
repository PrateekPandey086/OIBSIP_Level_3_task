import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [coupon, setCoupon] = useState(null);
    const [discount, setDiscount] = useState(0);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart:', e);
            }
        }
    }, []);

    // Save cart to localStorage
    const saveCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    // Add to cart
    const addToCart = (item) => {
        const existingIndex = cart.findIndex(
            (c) =>
                c.pizza === item.pizza &&
                c.size === item.size &&
                JSON.stringify(c.customizations) === JSON.stringify(item.customizations)
        );

        if (existingIndex > -1) {
            const newCart = [...cart];
            newCart[existingIndex].quantity += item.quantity || 1;
            saveCart(newCart);
        } else {
            saveCart([...cart, { ...item, quantity: item.quantity || 1 }]);
        }
        toast.success(`${item.name} added to cart!`);
    };

    // Remove from cart
    const removeFromCart = (index) => {
        const newCart = cart.filter((_, i) => i !== index);
        saveCart(newCart);
        toast.success('Item removed from cart');
    };

    // Update quantity
    const updateQuantity = (index, quantity) => {
        if (quantity <= 0) {
            removeFromCart(index);
            return;
        }
        const newCart = [...cart];
        newCart[index].quantity = quantity;
        saveCart(newCart);
    };

    // Clear cart
    const clearCart = () => {
        saveCart([]);
        setCoupon(null);
        setDiscount(0);
    };

    // Calculations
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const deliveryCharge = subtotal > 500 || subtotal === 0 ? 0 : 40;
    const total = Math.max(0, subtotal + tax + deliveryCharge - discount);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                coupon,
                setCoupon,
                discount,
                setDiscount,
                subtotal,
                tax,
                deliveryCharge,
                total,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
