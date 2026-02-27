'use client';

import Link from 'next/link';
import { UserCircle, Package, ShoppingCart, Minus, Plus, Trash2, Zap, LogOut, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
// Use local Product type or import from shared types when available
import { productService } from '@/app/services/productService';
import { Product } from '@/app/types/product';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { cart, updateQuantity, removeFromCart, getTotalItems } = useCart();
    const { user, login, logout, isLoginModalOpen, setIsLoginModalOpen, isRegisterModalOpen, setIsRegisterModalOpen } = useAuth();
    const [cartProducts, setCartProducts] = useState<Product[]>([]);

    // Form states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const loadCartProducts = async () => {
            const ids = cart.map((item: any) => item.productId);
            if (ids.length === 0) {
                setCartProducts([]);
                return;
            }
            try {
                const fetchedProducts = await productService.getProducts({}); // Or however we fetch it
                setCartProducts(fetchedProducts);
            } catch (error) {
                console.error('Failed to load cart products in navbar:', error);
            }
        };

        // We fetch when cart ids change
        loadCartProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(cart.map((c: any) => c.productId).sort())]);

    const getTotalPrice = () => {
        return cart.reduce((total: number, item: any) => {
            const product = cartProducts.find((p: any) => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    };

    const isProductsPage = pathname?.startsWith('/products');

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsSubmitting(true);
        const success = await login(email, password);
        setIsSubmitting(false);
        if (success) {
            setIsLoginModalOpen(false);
            setEmail("");
            setPassword("");
        } else {
            setErrorMsg("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน");
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, fullName, phoneNumber }),
            });

            if (res.ok) {
                setIsRegisterModalOpen(false);
                setIsLoginModalOpen(true); // Switch to login
                setPassword(""); // Clear password, keep email
            } else {
                const data = await res.json();
                setErrorMsg(data.message || "การสมัครสมาชิกขัดข้อง");
            }
        } catch (error) {
            console.error(error);
            setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <nav className="w-full border-b border-gray-200/50 bg-white/60 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 group p-2 rounded-xl hover:bg-gray-100/50 transition-all duration-300">
                        <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <UserCircle className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-gray-700 group-hover:text-primary transition-colors">
                            บัญชีของฉัน
                        </span>
                    </Link>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-3">
                            {user ? (
                                <button
                                    onClick={() => {
                                        logout();
                                        router.push('/');
                                        setIsLoginModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-full transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    ออกจากระบบ
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            setErrorMsg("");
                                            setIsLoginModalOpen(true);
                                        }}
                                        className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                                    >
                                        เข้าสู่ระบบ
                                    </button>
                                    <button
                                        onClick={() => {
                                            setErrorMsg("");
                                            setIsRegisterModalOpen(true);
                                        }}
                                        className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-sm font-medium transition-all shadow-sm"
                                    >
                                        สมัครสมาชิก
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
                        {isProductsPage ? (
                            /* Cart Drawer from Navbar */
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="relative group border-gray-200 bg-white/50 hover:bg-gray-50/80">
                                        <ShoppingCart className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                                        ตะกร้า
                                        {getTotalItems() > 0 && (
                                            <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-[10px] bg-primary text-white rounded-full animate-in zoom-in">
                                                {getTotalItems()}
                                            </Badge>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-white/95 backdrop-blur-md border-l border-white/20">
                                    <SheetHeader>
                                        <SheetTitle className="flex items-center gap-2">
                                            <ShoppingCart className="w-5 h-5" /> ตะกร้าสินค้าของคุณ ({getTotalItems()} ชิ้น)
                                        </SheetTitle>
                                        <SheetDescription className="hidden">ตะกร้าสินค้าของคุณ</SheetDescription>
                                    </SheetHeader>

                                    <div className="flex-1 mt-6 space-y-4 overflow-y-auto pr-2">
                                        {cart.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                                <div className="bg-gray-100/50 p-6 rounded-full mb-4">
                                                    <ShoppingCart className="w-12 h-12 opacity-50 text-gray-400" />
                                                </div>
                                                <p className="font-medium text-gray-600">ยังไม่มีสินค้าในตะกร้า</p>
                                                <p className="text-sm text-gray-400 mt-1">เลือกซื้อสินค้าที่คุณต้องการได้เลย</p>
                                            </div>
                                        ) : (
                                            cart.map((item: any) => {
                                                const product = cartProducts.find((p: any) => p.id === item.productId);
                                                if (!product) return null; // loading state essentially
                                                return (
                                                    <div key={product.id} className="flex gap-4 border-b border-gray-100 pb-4 group">
                                                        <div className="w-20 h-20 bg-white rounded-xl shadow-sm border border-gray-100 flex-shrink-0 p-2">
                                                            <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                                        </div>
                                                        <div className="flex-1 flex flex-col justify-between">
                                                            <div>
                                                                <h4 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
                                                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description}</p>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-3">
                                                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                                                    <button className="h-6 w-6 rounded-md bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors" onClick={() => updateQuantity(product.id, item.quantity - 1)}>
                                                                        <Minus className="w-3 h-3" />
                                                                    </button>
                                                                    <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                                                                    <button
                                                                        className="h-6 w-6 rounded-md bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        onClick={() => updateQuantity(product.id, item.quantity + 1)}
                                                                        disabled={item.quantity >= product.stockQuantity}
                                                                    >
                                                                        <Plus className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <span className="font-bold text-primary">฿{(product.price * item.quantity).toLocaleString()}</span>
                                                                    <button className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => removeFromCart(product.id)}>
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {cart.length > 0 && (
                                        <div className="pt-6 border-t mt-auto px-1 pb-4">
                                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                                <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                                                    <span>ยอดรวมสินค้า</span>
                                                    <span>฿{getTotalPrice().toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-lg font-bold">
                                                    <span className="text-gray-900">ยอดรวมทั้งสิ้น</span>
                                                    <span className="text-primary text-2xl">฿{getTotalPrice().toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <Button className="w-full text-lg h-14 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-md" onClick={() => router.push('/cart')}>
                                                ดำเนินการชำระเงิน <Zap className="w-5 h-5 ml-2 fill-current" />
                                            </Button>
                                        </div>
                                    )}
                                </SheetContent>
                            </Sheet>
                        ) : (
                            <>
                                <Link
                                    href="/products"
                                    className="text-sm font-medium text-gray-700 hover:text-primary transition-colors flex items-center gap-2"
                                >
                                    <Package className="w-4 h-4" />
                                    สินค้าทั้งหมด
                                </Link>
                                <div className="w-px h-4 bg-gray-300"></div>
                                <Link
                                    href="/dev"
                                    className="px-4 py-2 bg-gray-900/5 hover:bg-gray-900/10 text-gray-700 rounded-full text-sm font-medium transition-all"
                                >
                                    Dev Dashboard
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Login Modal */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h2>
                                <button onClick={() => setIsLoginModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {errorMsg && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                    {errorMsg}
                                </div>
                            )}

                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70 mt-2"
                                >
                                    {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                                </button>
                            </form>

                            <div className="mt-6 text-center text-sm text-gray-500">
                                ยังไม่มีบัญชีใช่ไหม?{' '}
                                <button
                                    onClick={() => {
                                        setIsLoginModalOpen(false);
                                        setIsRegisterModalOpen(true);
                                    }}
                                    className="text-primary font-medium hover:underline"
                                >
                                    สมัครสมาชิก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Register Modal */}
            {isRegisterModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">สมัครสมาชิก</h2>
                                <button onClick={() => setIsRegisterModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {errorMsg && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                    {errorMsg}
                                </div>
                            )}

                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ - นามสกุล</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        placeholder="ชื่อจริง นามสกุล"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        placeholder="08X-XXX-XXXX"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70 mt-2"
                                >
                                    {isSubmitting ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิก'}
                                </button>
                            </form>

                            <div className="mt-6 text-center text-sm text-gray-500">
                                มีบัญชีอยู่แล้วใช่ไหม?{' '}
                                <button
                                    onClick={() => {
                                        setIsRegisterModalOpen(false);
                                        setIsLoginModalOpen(true);
                                    }}
                                    className="text-primary font-medium hover:underline"
                                >
                                    เข้าสู่ระบบ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
