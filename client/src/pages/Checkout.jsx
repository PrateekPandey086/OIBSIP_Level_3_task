import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Checkout = () => {
    const { cart, subtotal, tax, deliveryCharge, discount, total, coupon, setCoupon, setDiscount, clearCart, removeFromCart, updateQuantity } = useCart();
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            phone: user?.phone || '',
            street: user?.addresses?.[0]?.street || '',
            city: user?.addresses?.[0]?.city || '',
            state: user?.addresses?.[0]?.state || '',
            zipCode: user?.addresses?.[0]?.zipCode || '',
        },
    });

    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        try {
            const response = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal });
            const { coupon: couponData, discount: discountAmount } = response.data;
            setCoupon(couponData);
            setDiscount(discountAmount);
            toast.success(`Coupon applied! You saved ₹${discountAmount}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid coupon');
        }
    };

    const handleRemoveCoupon = () => {
        setCoupon(null);
        setDiscount(0);
        setCouponCode('');
        toast.success('Coupon removed');
    };

    const onSubmit = async (data) => {
        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        setLoading(true);

        try {
            // 1. Create MongoDB Order & Razorpay Order on Backend
            const orderResponse = await api.post('/payments/create-order', {
                address: {
                    street: data.street,
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode,
                },
                phone: data.phone,
                items: cart.map((item) => ({
                    pizza: item.pizza,
                    name: item.name,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price,
                    customizations: item.customizations,
                })),
                couponCode: coupon?.code || null,
                subtotal,
                tax,
                deliveryCharge,
                discount,
                total,
            });
            const { order, key } = orderResponse.data;

            // 2. Configure Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || key || 'rzp_test_your_key_id',
                amount: order.amount,
                currency: order.currency,
                name: 'PizzaCraft',
                description: 'Pizza Delivery Order',
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment and Update Order on Backend
                        const verifyResponse = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: order.mongoOrderId, // Pass the MongoDB order ID
                        });

                        toast.success('Payment successful! Order placed.');
                        clearCart();
                        navigate(`/orders/${verifyResponse.data.order._id}`);
                    } catch (err) {
                        toast.error(err.response?.data?.message || 'Payment verification failed');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: data.phone,
                },
                theme: {
                    color: '#E63946',
                },
            };

            // 4. Open Razorpay Checkout Modal
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Payment initiation error:', error.response?.status, error.response?.data);
            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Failed to initiate payment'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Delivery Details */}
            <div className="lg:col-span-7 flex flex-col gap-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark">Checkout</h1>
                    <p className="text-gray-500 mt-1">Complete your order details below</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="glass p-8 rounded-2xl shadow-sm flex flex-col gap-6">
                    <h3 className="text-xl font-bold text-dark border-b border-gray-100 pb-3">Delivery Address</h3>

                    {/* Phone */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            {...register('phone', {
                                required: 'Phone number is required',
                                pattern: { value: /^[0-9]{10}$/, message: 'Invalid 10-digit phone number' },
                            })}
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                            placeholder="9876543210"
                        />
                        {errors.phone && <span className="text-xs text-primary font-medium">{errors.phone.message}</span>}
                    </div>

                    {/* Street */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Street Address</label>
                        <input
                            type="text"
                            {...register('street', { required: 'Street address is required' })}
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                            placeholder="123 Pizza Lane, Sector 4"
                        />
                        {errors.street && <span className="text-xs text-primary font-medium">{errors.street.message}</span>}
                    </div>

                    {/* City, State, Zip */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">City</label>
                            <input
                                type="text"
                                {...register('city', { required: 'City is required' })}
                                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                                placeholder="Mumbai"
                            />
                            {errors.city && <span className="text-xs text-primary font-medium">{errors.city.message}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">State</label>
                            <input
                                type="text"
                                {...register('state', { required: 'State is required' })}
                                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                                placeholder="Maharashtra"
                            />
                            {errors.state && <span className="text-xs text-primary font-medium">{errors.state.message}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Zip Code</label>
                            <input
                                type="text"
                                {...register('zipCode', {
                                    required: 'Zip code is required',
                                    pattern: { value: /^[0-9]{6}$/, message: 'Invalid 6-digit zip code' },
                                })}
                                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                                placeholder="400001"
                            />
                            {errors.zipCode && <span className="text-xs text-primary font-medium">{errors.zipCode.message}</span>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || cart.length === 0}
                        className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Processing Payment...' : `Pay ₹${total} via Razorpay`}
                    </button>
                </form>
            </div>

            {/* Right Column: Order Summary & Coupon */}
            <div className="lg:col-span-5 flex flex-col gap-8">
                {/* Cart Items */}
                <div className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-dark border-b border-gray-100 pb-3">Your Order</h3>
                    {cart.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">Your cart is empty</p>
                    ) : (
                        <div className="flex flex-col gap-4 max-h-80 overflow-y-auto pr-2">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center gap-4 p-3 rounded-xl bg-white/50 border border-gray-100 shadow-sm">
                                    <div className="flex gap-3 items-center">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                                        <div>
                                            <h4 className="font-bold text-sm text-dark">{item.name}</h4>
                                            <span className="text-xs text-gray-500 capitalize">Size: {item.size}</span>
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2 mt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(idx, item.quantity - 1)}
                                                    className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-dark flex items-center justify-center text-xs font-bold transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="text-xs font-bold text-dark w-4 text-center">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(idx, item.quantity + 1)}
                                                    className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-dark flex items-center justify-center text-xs font-bold transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-sm text-dark">₹{item.price * item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(idx)}
                                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-primary flex items-center justify-center transition-colors"
                                            title="Remove item"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Coupon Section */}
                <div className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-dark">Apply Coupon</h3>
                    {!coupon ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm w-full bg-white/50"
                            />
                            <button
                                onClick={handleApplyCoupon}
                                className="px-5 py-2.5 bg-dark text-white font-bold rounded-xl text-sm hover:bg-primary transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded-xl">
                            <div>
                                <span className="font-bold text-green-700 text-sm">{coupon.code}</span>
                                <p className="text-xs text-green-600 mt-0.5">Discount of ₹{discount} applied</p>
                            </div>
                            <button onClick={handleRemoveCoupon} className="text-xs text-red-600 font-bold hover:underline">
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                {/* Pricing Summary */}
                <div className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-dark">Payment Summary</h3>
                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-semibold">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">GST (5%)</span>
                            <span className="font-semibold">₹{tax}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Delivery Charge</span>
                            <span className="font-semibold">{deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Coupon Discount</span>
                                <span>-₹{discount}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-gray-100 pt-3">
                            <span className="text-gray-700 font-bold">Grand Total</span>
                            <span className="text-primary font-extrabold text-xl">₹{total}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
