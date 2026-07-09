import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PizzaBuilder = () => {
    const [searchParams] = useSearchParams();
    const pizzaId = searchParams.get('pizzaId');
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [step, setStep] = useState(1);

    // Selections
    const [selectedBase, setSelectedBase] = useState(null);
    const [selectedSauce, setSelectedSauce] = useState(null);
    const [selectedCheese, setSelectedCheese] = useState(null);
    const [selectedVeggies, setSelectedVeggies] = useState([]);
    const [selectedExtras, setSelectedExtras] = useState([]);

    // Fetch inventory for ingredients
    const { data: inventoryData, isLoading } = useQuery({
        queryKey: ['inventory-ingredients'],
        queryFn: async () => {
            const response = await api.get('/inventory/category/base');
            const bases = response.data.items;
            const sauces = (await api.get('/inventory/category/sauce')).data.items;
            const cheeses = (await api.get('/inventory/category/cheese')).data.items;
            const veggies = (await api.get('/inventory/category/veggie')).data.items;
            const extras = (await api.get('/inventory/category/extra')).data.items;
            return { bases, sauces, cheeses, veggies, extras };
        },
    });

    // Pre-fill if pizzaId is provided
    const { data: pizzaData } = useQuery({
        queryKey: ['pizza-details', pizzaId],
        queryFn: async () => {
            if (!pizzaId) return null;
            const response = await api.get(`/pizzas/${pizzaId}`);
            return response.data.pizza;
        },
        enabled: !!pizzaId,
    });

    useEffect(() => {
        if (pizzaData && inventoryData) {
            // Find matching base, sauce, cheese from ingredients list
            const baseItem = inventoryData.bases.find((b) => pizzaData.ingredients.includes(b.name)) || inventoryData.bases[0];
            const sauceItem = inventoryData.sauces.find((s) => pizzaData.ingredients.includes(s.name)) || inventoryData.sauces[0];
            const cheeseItem = inventoryData.cheeses.find((c) => pizzaData.ingredients.includes(c.name)) || inventoryData.cheeses[0];

            setSelectedBase(baseItem);
            setSelectedSauce(sauceItem);
            setSelectedCheese(cheeseItem);

            const vegItems = inventoryData.veggies.filter((v) => pizzaData.ingredients.includes(v.name));
            setSelectedVeggies(vegItems);
        } else if (inventoryData) {
            setSelectedBase(inventoryData.bases[0]);
            setSelectedSauce(inventoryData.sauces[0]);
            setSelectedCheese(inventoryData.cheeses[0]);
        }
    }, [pizzaData, inventoryData]);

    if (isLoading || !selectedBase) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-cream">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-primary font-semibold">Loading ingredients...</p>
                </div>
            </div>
        );
    }

    const { bases, sauces, cheeses, veggies, extras } = inventoryData;

    // Calculations
    const basePrice = pizzaData ? pizzaData.basePrice : 199;
    const customizationsPrice =
        (selectedBase?.price || 0) +
        (selectedSauce?.price || 0) +
        (selectedCheese?.price || 0) +
        selectedVeggies.reduce((acc, v) => acc + v.price, 0) +
        selectedExtras.reduce((acc, e) => acc + e.price, 0);

    const totalPrice = basePrice + customizationsPrice;
    const totalCalories = (pizzaData?.calories || 600) + selectedVeggies.length * 40 + selectedExtras.length * 150;

    const handleVeggieToggle = (veg) => {
        if (selectedVeggies.some((v) => v._id === veg._id)) {
            setSelectedVeggies(selectedVeggies.filter((v) => v._id !== veg._id));
        } else {
            setSelectedVeggies([...selectedVeggies, veg]);
        }
    };

    const handleExtraToggle = (extra) => {
        if (selectedExtras.some((e) => e._id === extra._id)) {
            setSelectedExtras(selectedExtras.filter((e) => e._id !== extra._id));
        } else {
            setSelectedExtras([...selectedExtras, extra]);
        }
    };

    const handleAddToOrder = () => {
        addToCart({
            pizza: pizzaId || null,
            name: pizzaData ? `Customized ${pizzaData.name}` : 'My Custom Pizza',
            image: pizzaData?.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
            price: totalPrice,
            size: 'medium',
            quantity: 1,
            isCustom: true,
            customizations: {
                base: { name: selectedBase.name, price: selectedBase.price },
                sauce: { name: selectedSauce.name, price: selectedSauce.price },
                cheese: { name: selectedCheese.name, price: selectedCheese.price },
                veggies: selectedVeggies.map((v) => ({ name: v.name, price: v.price })),
                extras: selectedExtras.map((e) => ({ name: e.name, price: e.price })),
            },
        });
        navigate('/checkout');
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left side: Configurator */}
            <div className="lg:col-span-8 flex flex-col gap-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark">
                        {pizzaData ? `Customize ${pizzaData.name}` : 'Pizza Builder'}
                    </h1>
                    <p className="text-gray-500 mt-1">Design your culinary masterpiece step-by-step</p>
                </div>

                {/* Step Indicator */}
                <div className="flex justify-between border-b border-gray-200 pb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStep(s)}
                            className={`pb-2 px-2 font-bold text-sm border-b-2 transition-all ${step === s ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Step {s}: {['Base', 'Sauce', 'Cheese', 'Veggies', 'Extras'][s - 1]}
                        </button>
                    ))}
                </div>

                {/* Step Content */}
                <div className="min-h-[300px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Step 1: Base */}
                            {step === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {bases.map((b) => (
                                        <div
                                            key={b._id}
                                            onClick={() => setSelectedBase(b)}
                                            className={`glass p-6 rounded-2xl cursor-pointer border-2 transition-all flex flex-col justify-between h-40 ${selectedBase?._id === b._id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            <div>
                                                <h3 className="font-bold text-lg">{b.name}</h3>
                                                <p className="text-xs text-gray-500 mt-1">Freshly rolled crust</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="text-sm font-semibold text-gray-600">+{b.price ? `₹${b.price}` : 'Free'}</span>
                                                {selectedBase?._id === b._id && <span className="text-primary text-lg">✓</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Step 2: Sauce */}
                            {step === 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {sauces.map((s) => (
                                        <div
                                            key={s._id}
                                            onClick={() => setSelectedSauce(s)}
                                            className={`glass p-6 rounded-2xl cursor-pointer border-2 transition-all flex flex-col justify-between h-40 ${selectedSauce?._id === s._id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            <div>
                                                <h3 className="font-bold text-lg">{s.name}</h3>
                                                <p className="text-xs text-gray-500 mt-1">Flavorful base sauce</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="text-sm font-semibold text-gray-600">+{s.price ? `₹${s.price}` : 'Free'}</span>
                                                {selectedSauce?._id === s._id && <span className="text-primary text-lg">✓</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Step 3: Cheese */}
                            {step === 3 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {cheeses.map((c) => (
                                        <div
                                            key={c._id}
                                            onClick={() => setSelectedCheese(c)}
                                            className={`glass p-6 rounded-2xl cursor-pointer border-2 transition-all flex flex-col justify-between h-40 ${selectedCheese?._id === c._id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            <div>
                                                <h3 className="font-bold text-lg">{c.name}</h3>
                                                <p className="text-xs text-gray-500 mt-1">Premium melted cheese</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="text-sm font-semibold text-gray-600">+{c.price ? `₹${c.price}` : 'Free'}</span>
                                                {selectedCheese?._id === c._id && <span className="text-primary text-lg">✓</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Step 4: Veggies */}
                            {step === 4 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {veggies.map((v) => {
                                        const isSelected = selectedVeggies.some((veg) => veg._id === v._id);
                                        return (
                                            <div
                                                key={v._id}
                                                onClick={() => handleVeggieToggle(v)}
                                                className={`glass p-4 rounded-xl cursor-pointer border-2 transition-all flex flex-col justify-between h-32 ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-gray-200'
                                                    }`}
                                            >
                                                <h4 className="font-bold text-sm">{v.name}</h4>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-xs font-semibold text-gray-500">+₹{v.price}</span>
                                                    {isSelected && <span className="text-primary text-sm">✓</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Step 5: Extras */}
                            {step === 5 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {extras.map((e) => {
                                        const isSelected = selectedExtras.some((ext) => ext._id === e._id);
                                        return (
                                            <div
                                                key={e._id}
                                                onClick={() => handleExtraToggle(e)}
                                                className={`glass p-6 rounded-2xl cursor-pointer border-2 transition-all flex flex-col justify-between h-40 ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-gray-200'
                                                    }`}
                                            >
                                                <div>
                                                    <h3 className="font-bold text-lg">{e.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">Sides & beverages</p>
                                                </div>
                                                <div className="flex justify-between items-center mt-4">
                                                    <span className="text-sm font-semibold text-gray-600">+₹{e.price}</span>
                                                    {isSelected && <span className="text-primary text-lg">✓</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <button
                        disabled={step === 1}
                        onClick={() => setStep(step - 1)}
                        className="px-6 py-3 rounded-full border border-gray-200 font-bold text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        Back
                    </button>
                    {step < 5 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="px-6 py-3 rounded-full bg-dark text-white font-bold text-sm hover:bg-primary transition-colors"
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            onClick={handleAddToOrder}
                            className="px-8 py-3.5 rounded-full bg-primary text-white font-bold text-sm hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            Add to Order
                        </button>
                    )}
                </div>
            </div>

            {/* Right side: Live Preview & Sticky Summary */}
            <div className="lg:col-span-4 flex flex-col gap-8 lg:sticky lg:top-24 h-fit">
                {/* Live Pizza Preview */}
                <div className="glass p-6 rounded-2xl shadow-sm flex flex-col items-center gap-4">
                    <h3 className="font-bold text-lg text-dark self-start">Live Preview</h3>
                    <div className="relative w-64 h-64 flex items-center justify-center bg-cream/50 rounded-full border border-gray-100 shadow-inner">
                        {/* Pizza Base SVG */}
                        <svg viewBox="0 0 100 100" className="w-56 h-56 drop-shadow-lg">
                            {/* Crust */}
                            <circle cx="50" cy="50" r="46" fill="#e29555" stroke="#c67a3b" strokeWidth="2" />
                            {/* Cheese Burst / Stuffed Crust indicator */}
                            {selectedBase?.name === 'Cheese Burst' && (
                                <circle cx="50" cy="50" r="43" fill="none" stroke="#fcd34d" strokeWidth="3" strokeDasharray="4 2" />
                            )}
                            {/* Sauce */}
                            <circle
                                cx="50"
                                cy="50"
                                r="41"
                                fill={
                                    selectedSauce?.name === 'Pesto Sauce'
                                        ? '#65a30d'
                                        : selectedSauce?.name === 'White Sauce'
                                            ? '#fef08a'
                                            : selectedSauce?.name === 'Barbeque Sauce'
                                                ? '#7c2d12'
                                                : '#dc2626'
                                }
                            />
                            {/* Cheese */}
                            <circle
                                cx="50"
                                cy="50"
                                r="38"
                                fill={selectedCheese?.name === 'Vegan Cheese' ? '#fef08a' : '#fef08a'}
                                opacity="0.85"
                            />

                            {/* Veggie toppings */}
                            {selectedVeggies.map((v, idx) => {
                                // Generate simple topping elements based on veggie name
                                if (v.name === 'Olives') {
                                    return (
                                        <g key={idx} fill="#1a1a1a">
                                            <circle cx="35" cy="35" r="2.5" />
                                            <circle cx="65" cy="35" r="2.5" />
                                            <circle cx="50" cy="65" r="2.5" />
                                            <circle cx="35" cy="55" r="2.5" />
                                            <circle cx="65" cy="55" r="2.5" />
                                        </g>
                                    );
                                }
                                if (v.name === 'Tomato') {
                                    return (
                                        <g key={idx} fill="#ef4444">
                                            <circle cx="45" cy="30" r="3.5" />
                                            <circle cx="55" cy="70" r="3.5" />
                                            <circle cx="30" cy="50" r="3.5" />
                                            <circle cx="70" cy="50" r="3.5" />
                                        </g>
                                    );
                                }
                                if (v.name === 'Capsicum') {
                                    return (
                                        <g key={idx} stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round">
                                            <path d="M 35 40 Q 38 38 40 42" />
                                            <path d="M 60 45 Q 63 42 65 47" />
                                            <path d="M 45 60 Q 48 58 50 62" />
                                        </g>
                                    );
                                }
                                if (v.name === 'Onion') {
                                    return (
                                        <g key={idx} stroke="#a855f7" strokeWidth="1.5" fill="none">
                                            <circle cx="40" cy="45" r="3" />
                                            <circle cx="60" cy="60" r="3" />
                                            <circle cx="50" cy="35" r="3" />
                                        </g>
                                    );
                                }
                                if (v.name === 'Jalapeno') {
                                    return (
                                        <g key={idx} fill="#15803d">
                                            <circle cx="42" cy="55" r="3" />
                                            <circle cx="58" cy="40" r="3" />
                                            <circle cx="48" cy="48" r="3" />
                                        </g>
                                    );
                                }
                                if (v.name === 'Mushroom') {
                                    return (
                                        <g key={idx} fill="#d1d5db">
                                            <path d="M 32 30 A 3 3 0 0 1 38 30 L 38 33 A 1 1 0 0 1 32 33 Z" />
                                            <path d="M 62 50 A 3 3 0 0 1 68 50 L 68 53 A 1 1 0 0 1 62 53 Z" />
                                        </g>
                                    );
                                }
                                return null;
                            })}
                        </svg>
                    </div>

                    {/* Details */}
                    <div className="w-full grid grid-cols-2 gap-4 text-center mt-2 border-t border-gray-100 pt-4">
                        <div>
                            <span className="text-xs text-gray-500">Calories</span>
                            <p className="font-bold text-dark">{totalCalories} kcal</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Time</span>
                            <p className="font-bold text-dark">{pizzaData?.cookTime || '20-25 min'}</p>
                        </div>
                    </div>
                </div>

                {/* Sticky Order Summary */}
                <div className="glass p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                    <h3 className="font-bold text-lg text-dark">Order Summary</h3>
                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Base Price</span>
                            <span className="font-semibold">₹{basePrice}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Customizations</span>
                            <span className="font-semibold">+₹{customizationsPrice}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-3">
                            <span className="text-gray-700 font-bold">Total Price</span>
                            <span className="text-primary font-extrabold text-lg">₹{totalPrice}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleAddToOrder}
                        className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        Add to Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PizzaBuilder;
