'use client';

import { useState, useEffect } from 'react';
import { Search, Tag, TrendingUp, Package, Pill, Syringe, HeartPulse, Sparkles, Activity, Stethoscope, Baby, Leaf } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { productsService, Product, Category } from '@/services/products.service';

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData] = await Promise.all([
          productsService.getAll(),
          // productsService.getAllCategories() // TODO: Implement categories
        ]);
        setProducts(productsData);
        // setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // router.push(`/store/search?q=${encodeURIComponent(searchQuery)}`);
      // For now, just filter locally or do nothing as per requirement simplicity
      console.log('Search:', searchQuery);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      pill: Pill,
      syringe: Syringe,
      'heart-pulse': HeartPulse,
      sparkles: Sparkles,
      activity: Activity,
      stethoscope: Stethoscope,
      baby: Baby,
      leaf: Leaf,
    };
    const Icon = icons[iconName] || Package;
    return <Icon className="w-8 h-8" />;
  };

  // Mock categories if not fetched
  const displayCategories = categories.length > 0 ? categories : [
    { id: '1', name: 'ยาสามัญ', icon: 'pill', count: 0 },
    { id: '2', name: 'เวชภัณฑ์', icon: 'stethoscope', count: 0 },
    { id: '3', name: 'อาหารเสริม', icon: 'leaf', count: 0 },
    { id: '4', name: 'อุปกรณ์การแพทย์', icon: 'activity', count: 0 },
  ];

  const promotedProducts = products.slice(0, 4);
  const recommendedProducts = products.slice(4, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl mb-4 font-bold">ร้านขายยาออนไลน์ที่คุณไว้วางใจ</h1>
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
                    className="pl-10 h-12 text-gray-900 bg-white"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="bg-teal-500 hover:bg-teal-400 text-white border-none">
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
            <h2 className="text-2xl font-bold text-gray-800">หมวดหมู่สินค้า</h2>
            <Button
              variant="outline"
              onClick={() => { }}
            >
              ดูสินค้าทั้งหมด
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {displayCategories.map((category: any) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-shadow border-gray-100"
                onClick={() => { }}
              >
                <CardContent className="p-6 text-center">
                  <div className="bg-teal-50 text-teal-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    {getIconComponent(category.icon || 'package')}
                  </div>
                  <p className="font-medium text-gray-700">{category.name}</p>
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
            <h2 className="text-2xl font-bold text-gray-800">โปรโมชั่นพิเศษ</h2>
          </div>

          {loading ? (
            <div className="text-center py-10">กำลังโหลดสินค้า...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotedProducts.map(product => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden bg-white"
                  onClick={() => { }}
                >
                  <div className="relative bg-gray-100 h-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image || 'https://placehold.co/300x200?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-contain p-4"
                    />
                    {product.isControlled && (
                      <Badge className="absolute top-2 right-2" variant="destructive">
                        ยาควบคุม
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2 text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-teal-600">฿{product.price}</span>
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
          )}
        </div>
      </section>

      {/* Recommended Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-800">สินค้าแนะนำ</h2>
          </div>

          {loading ? (
            <div className="text-center py-10">กำลังโหลดสินค้า...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map(product => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden bg-white"
                  onClick={() => { }}
                >
                  <div className="relative bg-gray-100 h-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image || 'https://placehold.co/300x200?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-contain p-4"
                    />
                    {product.isControlled && (
                      <Badge className="absolute top-2 right-2" variant="destructive">
                        ยาควบคุม
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2 text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-teal-600">฿{product.price}</span>
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
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-teal-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2 text-gray-800">ยารับรองคุณภาพ</h3>
              <p className="text-gray-600">สินค้าทุกรายการผ่านการรับรองจาก อย.</p>
            </div>
            <div className="text-center">
              <div className="bg-teal-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2 text-gray-800">เภสัชกรมืออาชีพ</h3>
              <p className="text-gray-600">ตรวจสอบคำสั่งซื้อโดยเภสัชกรผู้เชี่ยวชาญ</p>
            </div>
            <div className="text-center">
              <div className="bg-teal-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2 text-gray-800">จัดส่งรวดเร็ว</h3>
              <p className="text-gray-600">ส่งถึงบ้านคุณภายใน 24-48 ชั่วโมง</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
