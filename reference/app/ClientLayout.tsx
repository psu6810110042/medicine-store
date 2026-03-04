'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { UIProvider, useUI } from '@/contexts/UIContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { Toaster } from './components/ui/sonner';

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    const { isAuthModalOpen, closeAuthModal } = useUI();

    return (
        <>
            <Header />
            <main>{children}</main>
            <AuthModal open={isAuthModalOpen} onClose={closeAuthModal} />
            <Toaster position="top-right" />
            <Footer />
        </>
    );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <CartProvider>
                <UIProvider>
                    <div className="min-h-screen bg-gray-50">
                        <ClientLayoutContent>{children}</ClientLayoutContent>
                    </div>
                </UIProvider>
            </CartProvider>
        </AuthProvider>
    );
}
