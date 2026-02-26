'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
    id: string;
    email: string;
    phone: string;
    name: string;
    role: "customer" | "pharmacist" | "admin";
    address?: {
        street: string;
        district: string;
        province: string;
        postalCode: string;
    };
    healthData?: {
        allergies: string[];
        chronicDiseases: string[];
        currentMedications: string[];
    };
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
AuthContext.displayName = 'AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedUser = localStorage.getItem('currentUser');
                if (savedUser) return JSON.parse(savedUser);
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
            }
        }
        return null;
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const login = async (email: string, password: string): Promise<boolean> => {
        // In a real app, this would call the API.
        // For now, we'll let the Login page handle the API call and just update the context.
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
