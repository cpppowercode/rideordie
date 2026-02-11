'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login logic
        router.push('/');
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-sm shadow-sm border w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-8 uppercase tracking-wider">Ride Or Die</h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" className="w-full border p-3 rounded-sm bg-gray-50 focus:bg-white transition-colors" placeholder="user@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input type="password" className="w-full border p-3 rounded-sm bg-gray-50 focus:bg-white transition-colors" placeholder="••••••••" />
                    </div>

                    <button type="submit" className="w-full py-3 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
                        Login
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-black font-medium underline underline-offset-4">
                            Sign Up
                        </Link>
                    </p>
                </div>

                <div className="mt-8 flex items-center justify-center gap-4">
                    <button className="w-full py-2 border flex items-center justify-center font-medium hover:bg-green-50 text-green-600 border-green-200">
                        Naver Login
                    </button>
                    <button className="w-full py-2 border flex items-center justify-center font-medium hover:bg-yellow-50 text-yellow-600 border-yellow-200">
                        Kakao Login
                    </button>
                </div>
            </div>
        </div>
    );
}
