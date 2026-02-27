import Link from 'next/link';
import ImageUpload from '@/app/components/ImageUpload';

export default async function Home() {
    let testProductId = 'test-id';
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products?limit=1`, { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            const products = data.data || data;
            if (Array.isArray(products) && products.length > 0) {
                testProductId = products[0].id;
            }
        }
    } catch (error) {
        console.error('Failed to fetch test product ID:', error);
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]" />
            </div>

            <main className="flex flex-col items-center gap-8 text-center glass rounded-2xl p-12 shadow-2xl max-w-5xl w-full mx-4">
                <div className="space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl text-foreground">
                        <span className="text-gradient">Medicine Store</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                        Manage your pharmacy operations with elegance and efficiency. Access your workspace below.
                    </p>
                </div>

                {/* Upload Verification Components */}
                <section className="w-full flex flex-col md:flex-row gap-6 justify-center items-start mt-4">
                    <div className="flex-1 w-full max-w-sm space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground text-left">Public Products 🌍</h3>
                        <ImageUpload folder="products" label="Test Products Upload" />
                    </div>
                    <div className="flex-1 w-full max-w-sm space-y-2">
                        <h3 className="font-semibold text-sm text-orange-600 text-left">Private Prescriptions ⚕️</h3>
                        <ImageUpload folder="prescription" label="Test Prescription Upload" />
                    </div>
                    <div className="flex-1 w-full max-w-sm space-y-2">
                        <h3 className="font-semibold text-sm text-green-600 text-left">Private Payments 💸</h3>
                        <ImageUpload folder="payment-slips" label="Test Payment Upload" />
                    </div>
                </section>


                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full mt-8">
                    {/* Main App Routes */}
                    <Link href="/" className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-indigo-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">Home</span>
                        <span className="text-xs text-muted-foreground text-center">Root (`/`)</span>
                    </Link>

                    <Link href="/store" className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-rose-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">Store</span>
                        <span className="text-xs text-muted-foreground text-center">Storefront (`/store`)</span>
                    </Link>

                    <Link href="/products" className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-teal-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">Products List</span>
                        <span className="text-xs text-muted-foreground text-center">Browse (`/products`)</span>
                    </Link>

                    <Link href={`/products/${testProductId}`} className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-teal-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">Product Details</span>
                        <span className="text-xs text-muted-foreground text-center">Dynamic (`/products/[id]`)</span>
                    </Link>

                    <Link href="/cart" className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-yellow-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">Shopping Cart</span>
                        <span className="text-xs text-muted-foreground text-center">Checkout (`/cart`)</span>
                    </Link>

                    <Link href="/pharmacy" className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-cyan-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">Pharmacy</span>
                        <span className="text-xs text-muted-foreground text-center">Management (`/pharmacy`)</span>
                    </Link>

                    {/* User Auth Routes */}
                    <Link href="/login" className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-blue-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">Login</span>
                        <span className="text-xs text-muted-foreground text-center">Auth (`/login`)</span>
                    </Link>

                    <Link href="/register" className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-green-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">Register</span>
                        <span className="text-xs text-muted-foreground text-center">Auth (`/register`)</span>
                    </Link>

                    <Link href="/dashboard" className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-purple-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">User Dashboard</span>
                        <span className="text-xs text-muted-foreground text-center">Profile (`/dashboard`)</span>
                    </Link>

                    {/* Admin Routes */}
                    <Link href="/admin" className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-orange-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">Admin Root</span>
                        <span className="text-xs text-muted-foreground text-center">System (`/admin`)</span>
                    </Link>

                    <Link href="/admin/products" className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-orange-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">Admin Products</span>
                        <span className="text-xs text-muted-foreground text-center">List (`/admin/products`)</span>
                    </Link>

                    <Link href="/admin/products/add" className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-orange-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">Add Product</span>
                        <span className="text-xs text-muted-foreground text-center">Form (`/admin/products/add`)</span>
                    </Link>

                    <Link href={`/admin/products/${testProductId}/edit`} className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-orange-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">Edit Product</span>
                        <span className="text-xs text-muted-foreground text-center">Dynamic (`/admin/products/[id]/edit`)</span>
                    </Link>

                    {/* System Routes */}
                    <Link href="/_not-found" className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md hover:border-red-500/50 hover:-translate-y-1">
                        <span className="font-semibold text-foreground">404 Page</span>
                        <span className="text-xs text-muted-foreground text-center">Error (`/_not-found`)</span>
                    </Link>
                </div>
            </main>
        </div>
    );
}
