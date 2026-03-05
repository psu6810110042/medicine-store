'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserCircle, Package, ShoppingCart, Minus, Plus, Trash2, Zap, LogOut, X, Pill, Menu, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { productService } from '@/app/services/productService';
import { Product } from '@/app/types/product';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart, updateQuantity, removeFromCart, getTotalItems } = useCart();
  const { user, login, logout, isLoginModalOpen, setIsLoginModalOpen, isRegisterModalOpen, setIsRegisterModalOpen } = useAuth();
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
        const fetchedProducts = await productService.getProducts({});
        setCartProducts(fetchedProducts);
      } catch (error) {
        console.error('Failed to load cart products in navbar:', error);
      }
    };
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
        setIsLoginModalOpen(true);
        setPassword("");
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

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navigation = [
    { name: 'หน้าแรก', path: '/' },
    { name: 'สินค้าทั้งหมด', path: '/products' },
    { name: 'สั่งยา', path: '/prescription' },
  ];

  return (
    <>
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <Image src="/logo.png" alt="MEDS Logo" fill className="object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-primary tracking-tight">MEDS</h1>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">ร้านขายยาออนไลน์</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navigation.map(item => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium transition-colors ${isActive(item.path)
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">

              {/* Desktop conditional menu or user profile elements */}
              {user && user.role !== 'customer' && (
                <Link
                  href={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="hidden md:block text-sm font-medium text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full transition-colors"
                >
                  {user.role === 'admin' ? '🔐 ระบบผู้ดูแล' : 'จัดการคำสั่งซื้อ'}
                </Link>
              )}

              {/* Cart Sheet Button */}
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                    {getTotalItems() > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-in zoom-in border-2 border-white">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>

                {/* Cart Sliding Drawer content */}
                <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-white/95 backdrop-blur-md border-l border-white/20 p-0 sm:p-6">
                  <SheetHeader className="p-6 sm:p-0 border-b sm:border-0">
                    <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                      <ShoppingCart className="w-5 h-5 text-primary" /> ตะกร้าสินค้าของคุณ ({getTotalItems()} ชิ้น)
                    </SheetTitle>
                    <SheetDescription className="hidden">ตะกร้าสินค้าของคุณ</SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto w-full p-4 sm:p-0 sm:mt-6">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 min-h-[50vh]">
                        <div className="bg-gray-50 p-6 rounded-full mb-4">
                          <ShoppingCart className="w-12 h-12 opacity-30 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-600">ยังไม่มีสินค้าในตะกร้า</p>
                        <p className="text-sm text-gray-400 mt-1">เริ่มค้นหาสินค้าที่ต้องการได้เลย</p>
                        <Button className="mt-6 rounded-full" onClick={() => router.push('/products')}>
                          ไปเลือกซื้อสินค้า
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 pr-1">
                        {cart.map((item: any) => {
                          const product = cartProducts.find((p: any) => p.id === item.productId);
                          if (!product) return null;
                          return (
                            <div key={product.id} className="flex gap-4 p-3 sm:p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all group">
                              <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 p-2 overflow-hidden">
                                {product.image ? (
                                  <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Package className="w-8 h-8" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 flex flex-col justify-between py-1">
                                <div className="pr-6 relative">
                                  <h4 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors pr-2 text-sm sm:text-base">{product.name}</h4>
                                  {product.description && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description}</p>}
                                  <button className="absolute top-0 right-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" onClick={() => removeFromCart(product.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-1 sm:gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                    <button className="h-6 w-6 sm:h-7 sm:w-7 rounded-md bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors" onClick={() => updateQuantity(product.id, item.quantity - 1)}>
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs sm:text-sm font-semibold w-6 text-center">{item.quantity}</span>
                                    <button
                                      className="h-6 w-6 sm:h-7 sm:w-7 rounded-md bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      onClick={() => updateQuantity(product.id, item.quantity + 1)}
                                      disabled={item.quantity >= (product.stockQuantity || 0)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="font-bold text-primary whitespace-nowrap text-sm sm:text-base">฿{(product.price * item.quantity).toLocaleString()}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="mt-auto border-t bg-white p-4 sm:p-0 sm:pt-6 sm:pb-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] sm:shadow-none z-10 w-full">
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="flex justify-between items-center mb-1 text-sm text-gray-600">
                          <span>ยอดรวมสินค้า</span>
                          <span className="font-medium">฿{getTotalPrice().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-200/60 mt-2 pt-2">
                          <span className="text-gray-900 font-semibold">ยอดรวมทั้งสิ้น</span>
                          <span className="text-primary text-xl font-bold">฿{getTotalPrice().toLocaleString()}</span>
                        </div>
                      </div>
                      <Button className="w-full text-base sm:text-lg h-12 sm:h-14 rounded-xl shadow-md" onClick={() => {
                        setIsCartOpen(false);
                        router.push('/cart');
                      }}>
                        ดำเนินการชำระเงิน <Zap className="w-4 h-4 sm:w-5 sm:h-5 ml-2 fill-current" />
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              {/* User Menu Desktop */}
              {user ? (
                <div className="hidden md:flex items-center gap-2 ml-2">
                  <Link href="/profile">
                    <Button variant="ghost" className="flex items-center gap-2 rounded-full px-4 hover:bg-gray-100">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{(user as any).name || user.email}</span>
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full text-xs hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors">
                    ออกจากระบบ
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2 ml-2">
                  <Button variant="ghost" className="text-sm font-medium hover:bg-gray-100 rounded-full" onClick={() => setIsLoginModalOpen(true)}>
                    เข้าสู่ระบบ
                  </Button>
                  <Button className="text-sm font-medium rounded-full shadow-sm" onClick={() => setIsRegisterModalOpen(true)}>
                    สมัครสมาชิก
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-700 ml-1"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-1 px-2">
                {navigation.map(item => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl transition-colors ${isActive(item.path)
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-50 font-medium'
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}

                {user && user.role !== 'customer' && (
                  <Link
                    href={user.role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-xl text-amber-700 hover:bg-amber-50 font-medium mt-2"
                  >
                    {user.role === 'admin' ? '🔐 ระบบผู้ดูแล (Admin Panel)' : 'จัดการคำสั่งซื้อ'}
                  </Link>
                )}

                <div className="h-px bg-gray-100 my-2 mx-4"></div>

                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                        <UserCircle className="w-5 h-5" />
                      </div>
                      บัญชีของฉัน ({(user as any).name || user.email})
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium text-left w-full"
                    >
                      <div className="bg-red-100 p-1.5 rounded-lg text-red-600">
                        <LogOut className="w-5 h-5" />
                      </div>
                      ออกจากระบบ
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-2 px-2">
                    <Button
                      className="w-full justify-center h-12 rounded-xl text-base"
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      เข้าสู่ระบบ
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-center h-12 rounded-xl text-base"
                      onClick={() => {
                        setIsRegisterModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      สมัครสมาชิก
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">ยินดีต้อนรับกลับมา</h2>
                  <p className="text-sm text-gray-500 mt-1">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
                </div>
                <button onClick={() => setIsLoginModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors -mt-4 -mr-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-3">
                  <div className="mt-0.5"><Zap className="w-4 h-4 text-red-500" /></div>
                  <p>{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">อีเมล</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">รหัสผ่าน</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  title="login_button"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all disabled:opacity-70 mt-4 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
                >
                  {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm font-medium text-gray-500">
                ยังไม่มีบัญชีใช่ไหม?{' '}
                <button
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setIsRegisterModalOpen(true);
                  }}
                  className="text-primary hover:text-primary/80 transition-colors hover:underline decoration-2 underline-offset-4 font-bold"
                >
                  สมัครสมาชิกที่นี่
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 my-8 flex-shrink-0">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">สร้างบัญชีใหม่</h2>
                  <p className="text-sm text-gray-500 mt-1">เข้าร่วมกับเราเพื่อสุขภาพที่ดีกว่า</p>
                </div>
                <button onClick={() => setIsRegisterModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors -mt-4 -mr-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-3">
                  <div className="mt-0.5"><Zap className="w-4 h-4 text-red-500" /></div>
                  <p>{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">ชื่อ - นามสกุล</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="ชื่อจริง นามสกุล"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">อีเมล</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="08X-XXX-XXXX"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">รหัสผ่าน</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  title="register_button"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all disabled:opacity-70 mt-6 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
                >
                  {isSubmitting ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิก'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm font-medium text-gray-500">
                มีบัญชีอยู่แล้วใช่ไหม?{' '}
                <button
                  onClick={() => {
                    setIsRegisterModalOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="text-primary hover:text-primary/80 transition-colors hover:underline decoration-2 underline-offset-4 font-bold"
                >
                  เข้าสู่ระบบที่นี่
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

