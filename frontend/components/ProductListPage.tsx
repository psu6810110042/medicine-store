'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, ShoppingCart, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/app/types/product';
import { productService, FetchProductsParams } from '@/app/services/productService';
import { categoryService } from '@/app/services/categoryService';
import Image from 'next/image';

// Simple debounce function
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function ProductListPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialSearch = searchParams.get('search') || '';
    const initialCategory = searchParams.get('category') || 'all-categories';

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [search, setSearch] = useState(initialSearch);
    const debouncedSearch = useDebounce(search, 500);

    const [categoryFilter, setCategoryFilter] = useState(initialCategory);
    const [priceRange, setPriceRange] = useState('all');
    const [showInStock, setShowInStock] = useState(false);
    const [showControlled, setShowControlled] = useState(false);
    const [sortBy, setSortBy] = useState('name');

    const { addToCart } = useCart();
    const { user } = useAuth();

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params: FetchProductsParams = {};

            if (debouncedSearch) params.search = debouncedSearch;
            if (categoryFilter && categoryFilter !== 'all-categories') params.categoryId = categoryFilter;

            if (priceRange !== 'all') {
                const [min, max] = priceRange.split('-').map(Number);
                params.minPrice = min;
                if (max) params.maxPrice = max;
            }

            if (showInStock) params.inStock = true;
            if (showControlled) params.isControlled = true;

            // Map sortBy to backend expected values
            if (sortBy === 'price-asc') {
                params.sortBy = 'price';
                params.sortOrder = 'ASC';
            } else if (sortBy === 'price-desc') {
                params.sortBy = 'price';
                params.sortOrder = 'DESC';
            } else {
                params.sortBy = 'name';
                params.sortOrder = 'ASC';
            }

            const [data, categoryData] = await Promise.all([
                productService.getProducts(params),
                categoryService.getCategories()
            ]);
            setProducts(data);
            setCategories(categoryData);
        } catch (error) {
            console.error("Failed to load products", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, categoryFilter, priceRange, showInStock, showControlled, sortBy]);

    // Initial load and updates when filters change
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Sync URL params (optional but good for sharing links)
    // This might cause double rendering if we are strict, but for now it's fine.
    // Ideally we should drive state from URL or update URL from state.
    // Here we updated state from URL on mount, now updating URL from state.
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (categoryFilter && categoryFilter !== 'all-categories') params.set('category', categoryFilter);
        // Add other params if needed to persist state in URL

        // Use replace to avoid filling history stack with every keystroke
        router.replace(`/products?${params.toString()}`, { scroll: false });
    }, [debouncedSearch, categoryFilter, router]);


    const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (!user) {
            toast.error('กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า');
            return;
        }
        if (user.role !== 'customer') {
            toast.error('เฉพาะลูกค้าเท่านั้นที่สามารถสั่งซื้อสินค้าได้');
            return;
        }
        addToCart(product, 1);
        toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
    };

    const handleBuyNow = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (!user) {
            toast.error('กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า');
            return;
        }
        if (user.role !== 'customer') {
            toast.error('เฉพาะลูกค้าเท่านั้นที่สามารถสั่งซื้อสินค้าได้');
            return;
        }
        addToCart(product, 1);
        router.push('/checkout');
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryFilter('all-categories');
        setPriceRange('all');
        setShowInStock(false);
        setShowControlled(false);
        setSortBy('name');
    };

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Category Filter */}
            <div className="space-y-2">
                <Label className="text-gray-800 font-semibold">หมวดหมู่</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="ทุกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-categories">ทุกหมวดหมู่</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
                <Label className="text-gray-800 font-semibold">ช่วงราคา</Label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="ทุกช่วงราคา" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">ทุกช่วงราคา</SelectItem>
                        <SelectItem value="0-100">0 - 100 บาท</SelectItem>
                        <SelectItem value="100-500">100 - 500 บาท</SelectItem>
                        <SelectItem value="500-1000">500 - 1,000 บาท</SelectItem>
                        <SelectItem value="1000-99999">มากกว่า 1,000 บาท</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="in-stock"
                        checked={showInStock}
                        onCheckedChange={(checked) => setShowInStock(checked as boolean)}
                    />
                    <Label htmlFor="in-stock" className="cursor-pointer text-gray-800 font-medium">
                        มีสินค้าในสต็อก
                    </Label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="controlled"
                        checked={showControlled}
                        onCheckedChange={(checked) => setShowControlled(checked as boolean)}
                    />
                    <Label htmlFor="controlled" className="cursor-pointer text-gray-800 font-medium">
                        ยาควบคุมเท่านั้น
                    </Label>
                </div>
            </div>

            <Button variant="outline" className="w-full border-gray-300" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                ล้างตัวกรอง
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-4">รายการสินค้า</h1>

                    {/* Search & Sort */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                            <Input
                                type="text"
                                placeholder="ค้นหาสินค้า..."
                                className="pl-10 border-gray-300 placeholder:text-gray-500 text-gray-900 font-medium"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="เรียงตาม" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">ราคาสินค้า</SelectItem>
                                    <SelectItem value="price-asc">ราคา: ต่ำ - สูง</SelectItem>
                                    <SelectItem value="price-desc">ราคา: สูง - ต่ำ</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Mobile Filter */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="md:hidden">
                                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                                        ตัวกรอง
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>ตัวกรองสินค้า</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6">
                                        <FilterContent />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Desktop Filters */}
                    <aside className="hidden lg:block">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="font-bold mb-4 flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5" />
                                    ตัวกรองสินค้า
                                </h2>
                                <FilterContent />
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        <div className="mb-4 text-gray-600">
                            พบ {products.length} รายการ
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <Card key={i} className="h-96 animate-pulse bg-gray-200" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p className="text-gray-500">ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา</p>
                                    <Button variant="link" onClick={clearFilters} className="mt-2">
                                        ล้างตัวกรอง
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map(product => (
                                    <Card
                                        key={product.id}
                                        className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                                        onClick={() => router.push(`/products/${product.id}`)}
                                    >
                                        <div className="relative bg-gray-100 h-48">
                                            <Image
                                                src={product.image || 'https://via.placeholder.com/150'}
                                                alt={product.name}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                unoptimized
                                                className="object-contain p-4"
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
                                            {(product.stockQuantity <= 0 || !product.inStock) && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                                    <Badge variant="secondary" className="text-white bg-red-600 border-none px-4 py-1 text-base font-bold">
                                                        สินค้าหมด
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {product.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xl font-bold ${product.stockQuantity <= 0 || !product.inStock ? 'text-gray-400' : 'text-primary'}`}>
                                                    ฿{product.price.toLocaleString()}
                                                </span>
                                                {product.requiresPrescription && (
                                                    <Badge variant="outline" className="text-xs">
                                                        ใบสั่งแพทย์
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className={`mt-2 text-xs font-medium ${product.stockQuantity <= 0 || !product.inStock ? 'text-red-500' : 'text-gray-500'}`}>
                                                {product.stockQuantity <= 0 || !product.inStock ? 'สินค้าหมดสต็อก' : `คงเหลือ: ${product.stockQuantity} ชิ้น`}
                                            </div>

                                            <div className="mt-4 flex flex-col gap-2">
                                                <Button
                                                    className="w-full bg-primary hover:bg-primary/90"
                                                    size="sm"
                                                    disabled={product.stockQuantity <= 0 || !product.inStock}
                                                    onClick={(e) => handleBuyNow(e, product)}
                                                >
                                                    <Zap className="w-4 h-4 mr-2 fill-current" />
                                                    สั่งซื้อทันที
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    size="sm"
                                                    disabled={product.stockQuantity <= 0 || !product.inStock}
                                                    onClick={(e) => handleQuickAdd(e, product)}
                                                >
                                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                                    ใส่ตะกร้า
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
