'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
    isAuthModalOpen: boolean;
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    return (
        <UIContext.Provider value={{ isAuthModalOpen, openAuthModal, closeAuthModal }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within UIProvider');
    }
    return context;
};
