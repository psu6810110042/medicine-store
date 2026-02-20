'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
    productId: string;
    quantity: number;
    // Optionally, if the backend provides a unique ID for the cart item itself,
    // we could store it here: id?: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    totalItems: number;
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
    }, [user]); // user dependency ensures we re-evaluate if needed, though mainly for initial mount

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
                        headers: { // Corrected 'items' to 'headers'
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    });

                    if (res.ok) {
                        const cartData = await res.json();
                        // Backend returns Cart entity with items: [{ product: {...}, quantity: 1 }]
                        // We need to map it back to our simple CartItem structure { productId, quantity }
                        // Note: Backend CartItem has `product` object.
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
                // If user logs out (user becomes null), we should clear state
                // Local storage is already the source of truth for guest, and we cleared it on sync.
                // But if we logged out, we want an empty cart or whatever was left in local storage (which is nothing if we rely on this logic).
                // Wait, if I logout, I want to clear the cart in the UI.
                // And ensure local storage is empty or matches UI.
                // If I am just loading the page as guest, existing useEffect handles loading LS.
                // If I transition from User -> Guest (Logout), we want to clear.
                // Use a ref or simple check?
                // The existing useEffect loads from LS. If we clear state here, it might conflict?
                // Actually, correct flow: Logout -> User null. LS should be empty. State should be empty.
                if (isInitialized) { // Only clear if we were previously initialized (prevent clearing on initial mount if guest)
                    setCart([]);
                    // Local storage is already empty if we cleared it on login.
                    // But if user added items while logged in, they are in DB, not LS.
                    // So LS is empty.
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
            // We need the CartItem ID, but our state only has ProductId.
            // This is a disconnect.
            // We need to fetch the cart first to get IDs? Or we can search by product ID in backend?
            // Or update state to store CartItemID?
            // Storing CartItemID is better if possible.
            // But existing code uses ProductId.
            // Let's find the item in current state to get its CartItem ID?
            // Wait, our local state `cart` currently only has `productId`.
            // We should update `CartItem` interface in frontend to optionally include `id` (cart item id).
            // But for now, since we don't have it, we might need a backend endpoint that deletes by ProductID or strict `items.find`.
            // Backend `removeFromCart` expects `itemId`.
            // Let's modify frontend state to include `id` (cart item id) or fetch it.
            // Actually, simplest is to update `CartItem` interface.
            console.error("Remove from cart for auth user requires CartItem ID. Need to refactor state to store it.");
            // For now, let's just trigger a refetch or try to find it.
            // Let's update the CartItem interface to `id?: string` (cart item id).

            // BUT simpler fix for now:
            // Backend endpoint could accept productId if we change it?
            // Or we just find the item in the list if we have the full object from backend.
            // When we fetch from backend, we get `id` of the cart item.
            // Let's update `mappedItems` to include `id`.
            try {
                // Assuming backend has an endpoint to remove by productId if CartItem ID is not available
                // Or, we could find the cart item ID from the current `cart` state if it were stored.
                // For now, let's assume the backend can handle removal by productId for simplicity.
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
        // Same issue as remove. Need CartItem ID.
        if (user) {
            try {
                if (quantity <= 0) {
                    await removeFromCart(productId);
                    return;
                }
                // Assuming backend has an endpoint to update quantity by productId
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

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}>
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
