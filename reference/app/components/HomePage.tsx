'use client';

import { useState } from 'react';
import { Search, Tag, TrendingUp } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { categories, products } from '@/data/mockData';
import * as LucideIcons from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      pill: LucideIcons.Pill,
      syringe: LucideIcons.Syringe,
      'heart-pulse': LucideIcons.HeartPulse,
      sparkles: LucideIcons.Sparkles,
      activity: LucideIcons.Activity,
      stethoscope: LucideIcons.Stethoscope,
      baby: LucideIcons.Baby,
      leaf: LucideIcons.Leaf,
    };
    const Icon = icons[iconName] || LucideIcons.Package;
    return <Icon className="w-8 h-8" />;
  };

  // Get promoted products
  const promotedProducts = products.slice(0, 4);
  const recommendedProducts = products.slice(4, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl mb-4">ร้านขายยาออนไลน์ที่คุณไว้วางใจ</h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              จำหน่ายยาและเวชภัณฑ์คุณภาพ พร้อมบริการโดยเภสัชกรมืออาชีพ
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="ค้นหายา เวชภัณฑ์ หรือผลิตภัณฑ์สุขภาพ..."
                    className="pl-10 h-12 text-gray-900"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                  ค้นหา
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">หมวดหมู่สินค้า</h2>
            <Button
              variant="outline"
              onClick={() => router.push('/products')}
            >
              ดูสินค้าทั้งหมด
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map(category => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/products?category=${category.id}`)}
              >
                <CardContent className="p-4 text-center">
                  <div className="bg-teal-50 text-teal-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    {getIconComponent(category.icon)}
                  </div>
                  <p className="text-sm font-medium mb-1">{category.name}</p>
                  <p className="text-xs text-gray-500">{category.count} รายการ</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Promoted Products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold">โปรโมชั่นพิเศษ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {promotedProducts.map(product => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <div className="relative bg-gray-100 h-48">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent && !parent.querySelector('.fallback-text')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'fallback-text absolute inset-0 flex items-center justify-center text-gray-400';
                        fallback.innerHTML = `<div class="text-center"><svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-sm">${product.name}</p></div>`;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                  {product.isControlled && (
                    <Badge className="absolute top-2 right-2" variant="destructive">
                      ยาควบคุม
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">฿{product.price}</span>
                    {product.requiresPrescription && (
                      <Badge variant="outline" className="text-xs">
                        ใบสั่งแพทย์
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-bold">สินค้าแนะนำ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map(product => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <div className="relative bg-gray-100 h-48">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent && !parent.querySelector('.fallback-text')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'fallback-text absolute inset-0 flex items-center justify-center text-gray-400';
                        fallback.innerHTML = `<div class="text-center"><svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-sm">${product.name}</p></div>`;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                  {product.isControlled && (
                    <Badge className="absolute top-2 right-2" variant="destructive">
                      ยาควบคุม
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">฿{product.price}</span>
                    {product.requiresPrescription && (
                      <Badge variant="outline" className="text-xs">
                        ใบสั่งแพทย์
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-teal-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <LucideIcons.ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2">ยารับรองคุณภาพ</h3>
              <p className="text-gray-600">สินค้าทุกรายการผ่านการรับรองจาก อย.</p>
            </div>
            <div className="text-center">
              <div className="bg-teal-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <LucideIcons.UserCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2">เภสัชกรมืออาชีพ</h3>
              <p className="text-gray-600">ตรวจสอบคำสั่งซื้อโดยเภสัชกรผู้เชี่ยวชาญ</p>
            </div>
            <div className="text-center">
              <div className="bg-teal-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <LucideIcons.Truck className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2">จัดส่งรวดเร็ว</h3>
              <p className="text-gray-600">ส่งถึงบ้านคุณภายใน 24-48 ชั่วโมง</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
