"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    // Ensure cookies are sent with the request
                    credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    router.push("/login");
                }
            } catch (error) {
                console.error(error);
                router.push("/login");
            }
        };

        fetchUser();
    }, [router]);

    if (!user) return <div className="p-4">Loading...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <div className="bg-white shadow p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Welcome, {user.fullName}!</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Role:</strong> {user.role}</p>
            </div>
            <button
                className="mt-4 bg-red-500 text-white p-2 rounded"
                onClick={async () => {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: "POST", credentials: "include" });
                    router.push("/login");
                }}
            >
                Logout
            </button>
        </div>
    );
}
