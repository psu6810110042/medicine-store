'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
    productId: string;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    removeItemsLocally: (productIds: string[]) => void;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
CartContext.displayName = 'CartContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const { user } = useAuth();
    const [isInitialized, setIsInitialized] = useState(false);

    // Initial load from local storage
    useEffect(() => {
        if (!user) {
            try {
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    setCart(JSON.parse(savedCart));
                }
            } catch (error) {
                console.error('Failed to load cart from localStorage:', error);
            }
        }
        setIsInitialized(true);
    }, [user]);

    // Sync functionality (Merge local to server on login, fetch server cart)
    useEffect(() => {
        const syncAndFetchCart = async () => {
            if (user) {
                try {
                    // 1. Get local items to merge
                    const localCartJson = localStorage.getItem('cart');
                    const localItems: CartItem[] = localCartJson ? JSON.parse(localCartJson) : [];

                    // 2. Clear local storage immediately to avoid double sync
                    localStorage.removeItem('cart');

                    // 3. Sync/Merge with backend
                    if (localItems.length > 0) {
                        await fetch(`${API_URL}/cart/sync`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(localItems),
                            credentials: 'include',
                        });
                    }

                    // 4. Fetch updated cart from backend
                    const res = await fetch(`${API_URL}/cart`, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    });

                    if (res.ok) {
                        const cartData = await res.json();
                        const mappedItems = cartData.items.map((item: any) => ({
                            productId: item.product.id,
                            quantity: item.quantity
                        }));
                        setCart(mappedItems);
                    }
                } catch (error) {
                    console.error('Failed to sync/fetch cart:', error);
                }
            } else {
                if (isInitialized) {
                    setCart([]);
                }
            }
        };

        if (isInitialized) {
            syncAndFetchCart();
        }
    }, [user, isInitialized]);

    // Save to localStorage when cart changes (only for guest)
    useEffect(() => {
        if (!user && isInitialized) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, user, isInitialized]);

    const addToCart = async (productId: string, quantity: number = 1) => {
        if (user) {
            try {
                const res = await fetch(`${API_URL}/cart`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, quantity }),
                    credentials: 'include',
                });
                if (res.ok) {
                    const cartData = await res.json();
                    const mappedItems = cartData.items.map((item: any) => ({
                        productId: item.product.id,
                        quantity: item.quantity
                    }));
                    setCart(mappedItems);
                } else {
                    console.error('Failed to add to cart:', res.status, res.statusText);
                }
            } catch (error) {
                console.error('Add to cart failed:', error);
            }
        } else {
            setCart(prev => {
                const existingItem = prev.find(item => item.productId === productId);
                if (existingItem) {
                    return prev.map(item =>
                        item.productId === productId
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                }
                return [...prev, { productId, quantity }];
            });
        }
    };

    const removeFromCart = async (productId: string) => {
        if (user) {
            try {
                const res = await fetch(`${API_URL}/cart/remove-by-product/${productId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (res.ok) {
                    const cartData = await res.json();
                    const mappedItems = cartData.items.map((item: any) => ({
                        productId: item.product.id,
                        quantity: item.quantity
                    }));
                    setCart(mappedItems);
                } else {
                    console.error('Failed to remove from cart:', res.status, res.statusText);
                }
            } catch (error) {
                console.error('Remove from cart failed:', error);
            }
        } else {
            setCart(prev => prev.filter(item => item.productId !== productId));
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        if (user) {
            try {
                if (quantity <= 0) {
                    await removeFromCart(productId);
                    return;
                }
                const res = await fetch(`${API_URL}/cart/update-quantity/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity }),
                    credentials: 'include',
                });
                if (res.ok) {
                    const cartData = await res.json();
                    const mappedItems = cartData.items.map((item: any) => ({
                        productId: item.product.id,
                        quantity: item.quantity
                    }));
                    setCart(mappedItems);
                } else {
                    console.error('Failed to update quantity:', res.status, res.statusText);
                }
            } catch (error) {
                console.error('Update quantity failed:', error);
            }
        } else {
            setCart(prev =>
                prev.map(item =>
                    item.productId === productId
                        ? { ...item, quantity }
                        : item
                )
            );
        }
    };

    const clearCart = () => {
        setCart([]);
        if (!user) {
            localStorage.removeItem('cart');
        }
    };

    const removeItemsLocally = (productIds: string[]) => {
        setCart(prev => prev.filter(item => !productIds.includes(item.productId)));
        if (!user) {
            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const newCart = currentCart.filter((item: any) => !productIds.includes(item.productId));
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    };

    const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, removeItemsLocally, getTotalItems }}>
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
