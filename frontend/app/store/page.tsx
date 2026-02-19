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
    <div className="flex min-h-screen flex-col items-center bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 glass rounded-2xl p-8 shadow-lg">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              <span className="text-gradient">Medicine Store</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              จำหน่ายยาและเวชภัณฑ์คุณภาพ พร้อมบริการโดยเภสัชกรมืออาชีพ
            </p>
          </div>
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-md">
            <div className="flex gap-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="ค้นหายา..."
                className="pl-10 h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:bg-white transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                ค้นหา
              </Button>
            </div>
          </form>
        </header>

        {/* Categories */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">หมวดหมู่สินค้า</h2>
            <Button
              variant="outline"
              onClick={() => { }}
              className="bg-white/50 backdrop-blur-sm hover:bg-white/80"
            >
              ดูสินค้าทั้งหมด
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {displayCategories.map((category: any) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 bg-white/60 backdrop-blur-md border-white/20"
                onClick={() => { }}
              >
                <CardContent className="p-6 text-center">
                  <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    {getIconComponent(category.icon || 'package')}
                  </div>
                  <p className="font-medium text-foreground">{category.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Promoted Products */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <Tag className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">โปรโมชั่นพิเศษ</h2>
          </div>

          {loading ? (
            <div className="text-center py-20 bg-white/30 backdrop-blur-sm rounded-xl">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-4 bg-primary/50 rounded-full mb-2"></div>
                <p className="text-muted-foreground">กำลังโหลดสินค้า...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotedProducts.map(product => (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden bg-white/70 backdrop-blur-md border-white/20"
                  onClick={() => { }}
                >
                  <div className="relative bg-white/50 h-48 p-4">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image || 'https://placehold.co/300x200?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.isControlled && (
                      <Badge className="absolute top-2 right-2 shadow-sm" variant="destructive">
                        ยาควบคุม
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-lg font-bold text-primary">฿{product.price}</span>
                      {product.requiresPrescription && (
                        <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">
                          ใบสั่งแพทย์
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Recommended Products */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">สินค้าแนะนำ</h2>
          </div>

          {loading ? (
            <div className="text-center py-20 bg-white/30 backdrop-blur-sm rounded-xl">
              <p className="text-muted-foreground">กำลังโหลดสินค้า...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map(product => (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden bg-white/70 backdrop-blur-md border-white/20"
                  onClick={() => { }}
                >
                  <div className="relative bg-white/50 h-48 p-4">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image || 'https://placehold.co/300x200?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.isControlled && (
                      <Badge className="absolute top-2 right-2 shadow-sm" variant="destructive">
                        ยาควบคุม
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-lg font-bold text-primary">฿{product.price}</span>
                      {product.requiresPrescription && (
                        <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">
                          ใบสั่งแพทย์
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Features */}
        <section className="py-12 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/40 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
            <div className="text-center group">
              <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2 text-lg">ยารับรองคุณภาพ</h3>
              <p className="text-muted-foreground">สินค้าทุกรายการผ่านการรับรองจาก อย.</p>
            </div>
            <div className="text-center group">
              <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2 text-lg">เภสัชกรมืออาชีพ</h3>
              <p className="text-muted-foreground">ตรวจสอบคำสั่งซื้อโดยเภสัชกรผู้เชี่ยวชาญ</p>
            </div>
            <div className="text-center group">
              <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2 text-lg">จัดส่งรวดเร็ว</h3>
              <p className="text-muted-foreground">ส่งถึงบ้านคุณภายใน 24-48 ชั่วโมง</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
