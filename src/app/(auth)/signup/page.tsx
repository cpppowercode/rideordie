'use client';

import Link from 'next/link';

export default function SignupPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-sm shadow-sm border w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-8 uppercase tracking-wider">Create Account</h1>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input type="text" className="w-full border p-3 rounded-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" className="w-full border p-3 rounded-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input type="tel" className="w-full border p-3 rounded-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input type="password" className="w-full border p-3 rounded-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Confirm Password</label>
                        <input type="password" className="w-full border p-3 rounded-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>

                    <button type="button" className="w-full py-3 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors mt-4">
                        Sign Up
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-black font-medium underline underline-offset-4">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
