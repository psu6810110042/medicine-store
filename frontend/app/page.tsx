
'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  Search,
  Package,
  Pill,
  Syringe,
  HeartPulse,
  Sparkles,
  Activity,
  Stethoscope,
  Baby,
  Leaf,
  ShieldCheck,
  UserCheck,
  Truck,
  BadgePercent,
  Star,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { productService } from '@/app/services/productService';
import { categoryService } from '@/app/services/categoryService';
import { Product, Category } from '@/app/types/product';

function SearchForm() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set('search', search.trim());
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md">
      <div className="flex gap-2 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="ค้นหายา..."
          className="pl-10 h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus:bg-white transition-all"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
          ค้นหา
        </Button>
      </div>
    </form>
  );
}

function ProductQuickView({ product }: { product: Product }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Eye className="h-4 w-4" />
          ดูรายละเอียด
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.category?.name || 'สินค้าเภสัชภัณฑ์'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <div className="rounded-lg border bg-muted/30 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image || 'https://placehold.co/300x200?text=No+Image'}
              alt={product.name}
              className="h-36 w-full object-contain"
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{product.description || 'ไม่มีคำอธิบายสินค้า'}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">฿{product.price}</Badge>
              {product.isControlled && <Badge variant="destructive">ยาควบคุม</Badge>}
              {product.requiresPrescription && <Badge variant="outline">ใบสั่งแพทย์</Badge>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  return (
    <Card className="group overflow-hidden border-white/20 bg-white/70 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-48 bg-white/50 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image || 'https://placehold.co/300x200?text=No+Image'}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
        {product.isControlled && (
          <Badge className="absolute right-2 top-2 shadow-sm" variant="destructive">
            ยาควบคุม
          </Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">฿{product.price}</span>
          {product.requiresPrescription && (
            <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-[10px] text-yellow-700">
              ใบสั่งแพทย์
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <ProductQuickView product={product} />
        <Button onClick={onOpen} size="sm" className="w-full">
          รายละเอียด
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function StoreContent() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIconComponent = (iconName: string) => {
    type IconMap = Record<string, React.ElementType>;
    const icons: IconMap = {
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

  const promotedProducts = products.slice(0, 4);
  const recommendedProducts = products.slice(4, 8);
  const categoryOptions = [{ id: 'all', name: 'ทุกหมวดหมู่' }, ...categories];

  const filterByCategory = (items: Product[]) => {
    if (selectedCategory === 'all') {
      return items;
    }

    return items.filter(product => {
      if (product.category?.id) {
        return product.category.id === selectedCategory;
      }
      return product.categoryId === selectedCategory;
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 glass rounded-2xl p-8 shadow-lg relative">

          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              <span className="text-gradient">Medicine Store</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              จำหน่ายยาและเวชภัณฑ์คุณภาพ พร้อมบริการโดยเภสัชกรมืออาชีพ
            </p>
          </div>
          {/* Search Bar */}
          <SearchForm />
        </header>

        {/* Categories */}
        <section className="mb-16">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">หมวดหมู่สินค้า</h2>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full min-w-[220px] bg-white/70 backdrop-blur-sm md:w-[240px]">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => router.push(`/products`)}
                className="bg-white/50 backdrop-blur-sm hover:bg-white/80"
              >
                ดูสินค้าทั้งหมด
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {categories.map((category: Category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 bg-white/60 backdrop-blur-md border-white/20"
                onClick={() => {
                  const searchParams = new URLSearchParams();
                  searchParams.set('category', category.id.toString());

                  router.push(`/products?${searchParams.toString()}`);
                }}
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
              <BadgePercent className="w-5 h-5 text-red-500" />
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
              {filterByCategory(promotedProducts).map(product => (
                <ProductCard key={product.id} product={product} onOpen={() => router.push(`/products/${product.id}`)} />
              ))}
            </div>
          )}
        </section>

        {/* Recommended Products */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Star className="w-5 h-5 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">สินค้าแนะนำ</h2>
          </div>

          {loading ? (
            <div className="text-center py-20 bg-white/30 backdrop-blur-sm rounded-xl">
              <p className="text-muted-foreground">กำลังโหลดสินค้า...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filterByCategory(recommendedProducts).map(product => (
                <ProductCard key={product.id} product={product} onOpen={() => router.push(`/products/${product.id}`)} />
              ))}
            </div>
          )}
        </section>

        {/* Features */}
        <section className="py-12 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/40 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
            <div className="text-center group">
              <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2 text-lg">ยารับรองคุณภาพ</h3>
              <p className="text-muted-foreground">สินค้าทุกรายการผ่านการรับรองจาก อย.</p>
            </div>
            <div className="text-center group">
              <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2 text-lg">เภสัชกรมืออาชีพ</h3>
              <p className="text-muted-foreground">ตรวจสอบคำสั่งซื้อโดยเภสัชกรผู้เชี่ยวชาญ</p>
            </div>
            <div className="text-center group">
              <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8" />
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

export default function StorePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StoreContent />
    </Suspense>
  );
}
