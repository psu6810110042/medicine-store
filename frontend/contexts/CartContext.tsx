'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '@/app/types/product';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    getNormalItems: () => CartItem[];
    getControlledItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);
CartContext.displayName = 'CartContext';

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const addToCart = (product: Product, quantity: number = 1) => {
        setCart(prev => {
            const existingItem = prev.find(item => item.product.id === product.id);
            if (existingItem) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev =>
            prev.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    };

    const getNormalItems = () => {
        return cart.filter(item => !item.product.isControlled);
    };

    const getControlledItems = () => {
        return cart.filter(item => item.product.isControlled);
    };

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, isLoading]);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalItems,
                getTotalPrice,
                getNormalItems,
                getControlledItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
