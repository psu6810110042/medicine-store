import { useState } from 'react';
import { ShoppingCart, User, Menu, X, Pill } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useUI } from '@/contexts/UIContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { openAuthModal } = useUI();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
    { name: 'สินค้า', path: '/products' },
    { name: 'อัพโหลดใบสั่งยา', path: '/prescription' },
    ...(user?.role === 'pharmacist' || user?.role === 'admin'
      ? [{
        name: user?.role === 'admin' ? '🔐 Admin Panel' : 'จัดการคำสั่งซื้อ',
        path: '/admin'
      }]
      : []),
  ];

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="MEDS Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-xl text-primary">MEDS</h1>
              <p className="text-xs text-muted-foreground">ร้านขายยาออนไลน์</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map(item => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors ${isActive(item.path)
                  ? 'text-primary'
                  : 'text-gray-700 hover:text-primary'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            {user?.role === 'customer' && (
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {getTotalItems() > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.name}</span>
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  ออกจากระบบ
                </Button>
              </div>
            ) : (
              <Button onClick={openAuthModal} className="hidden md:flex">
                เข้าสู่ระบบ
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navigation.map(item => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-left px-4 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-accent text-primary font-medium'
                    : 'text-gray-700 hover:bg-accent'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    โปรไฟล์
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    openAuthModal();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  เข้าสู่ระบบ
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
