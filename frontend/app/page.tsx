import Link from 'next/link';
import ImageUpload from './_components/ImageUpload';

export default function Home() {
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

        {/* Upload Verification Component */}
        <section className="w-full max-w-md">
          <ImageUpload />
        </section>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full mt-8">
          {/* Home Route */}
          <Link
            href="/"
            className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-8 border border-border shadow-sm transition-all hover:shadow-md hover:border-indigo-500/50 hover:-translate-y-1"
          >
            <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            </div>
            <span className="font-semibold text-foreground">Home</span>
            <span className="text-xs text-muted-foreground">Root Page</span>
          </Link>

          {/* Login Route */}
          <Link
            href="/login"
            className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-8 border border-border shadow-sm transition-all hover:shadow-md hover:border-blue-500/50 hover:-translate-y-1"
          >
            <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
            </div>
            <span className="font-semibold text-foreground">Login</span>
            <span className="text-xs text-muted-foreground">Access your account</span>
          </Link>

          {/* Register Route */}
          <Link
            href="/register"
            className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-8 border border-border shadow-sm transition-all hover:shadow-md hover:border-green-500/50 hover:-translate-y-1"
          >
            <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" x2="20" y1="8" y2="14" /><line x1="23" x2="17" y1="11" y2="11" /></svg>
            </div>
            <span className="font-semibold text-foreground">Register</span>
            <span className="text-xs text-muted-foreground">Create a new account</span>
          </Link>

          {/* Dashboard Route */}
          <Link
            href="/dashboard"
            className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-8 border border-border shadow-sm transition-all hover:shadow-md hover:border-purple-500/50 hover:-translate-y-1"
          >
            <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
            </div>
            <span className="font-semibold text-foreground">Dashboard</span>
            <span className="text-xs text-muted-foreground">User Dashboard</span>
          </Link>

          {/* Products Route */}
          <Link
            href="/products"
            className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-8 border border-border shadow-sm transition-all hover:shadow-md hover:border-teal-500/50 hover:-translate-y-1"
          >
            <div className="p-3 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-10" /></svg>
            </div>
            <span className="font-semibold text-foreground">Products</span>
            <span className="text-xs text-muted-foreground">Browse Products</span>
          </Link>

          {/* Store Route */}
          <Link
            href="/store"
            className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-8 border border-border shadow-sm transition-all hover:shadow-md hover:border-rose-500/50 hover:-translate-y-1"
          >
            <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4a4 4 0 0 1 8 0v2" /></svg>
            </div>
            <span className="font-semibold text-foreground">Store</span>
            <span className="text-xs text-muted-foreground">Store Front</span>
          </Link>

          {/* Admin Route */}
          <Link
            href="/admin/products"
            className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-8 border border-border shadow-sm transition-all hover:shadow-md hover:border-orange-500/50 hover:-translate-y-1"
          >
            <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
            </div>
            <span className="font-semibold text-foreground">Admin</span>
            <span className="text-xs text-muted-foreground">System Config</span>
          </Link>

          {/* ✅ Pharmacy Route (NEW) */}
          <Link
            href="/pharmacy"
            className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-8 border border-border shadow-sm transition-all hover:shadow-md hover:border-emerald-500/50 hover:-translate-y-1"
          >
            <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              {/* Pill Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m10.5 20.5-7-7a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7Z" />
                <path d="m8.5 8.5 7 7" />
              </svg>
            </div>
            <span className="font-semibold text-foreground">Pharmacy</span>
            <span className="text-xs text-muted-foreground">Role Pharmacy</span>
          </Link>

          {/* Not Found Route */}
          <Link
            href="/_not-found"
            className="group relative flex flex-col items-center justify-center gap-2 rounded-xl bg-card p-8 border border-border shadow-sm transition-all hover:shadow-md hover:border-red-500/50 hover:-translate-y-1"
          >
            <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
            </div>
            <span className="font-semibold text-foreground">Not Found</span>
            <span className="text-xs text-muted-foreground">404 Test</span>
          </Link>
        </div>
      </main>
    </div>
  );
}