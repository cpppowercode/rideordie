'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PRODUCT_DATA } from '@/lib/mockData';

export default function CheckoutPage() {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            router.push('/checkout/success');
        }, 1500);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-8">Checkout</h1>

            <form onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Section: Shipping Info */}
                    <section className="bg-white p-6 rounded-sm border shadow-sm">
                        <h2 className="text-lg font-bold mb-4">Customer Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input type="text" required className="w-full border p-2 rounded-sm" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input type="tel" required className="w-full border p-2 rounded-sm" placeholder="010-1234-5678" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" required className="w-full border p-2 rounded-sm" placeholder="john@example.com" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Lesson Date Request</label>
                                <input type="date" className="w-full border p-2 rounded-sm" />
                            </div>
                        </div>
                    </section>

                    {/* Section: Payment Method */}
                    <section className="bg-white p-6 rounded-sm border shadow-sm">
                        <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                        <div className="space-y-3">
                            <label className="flex items-center space-x-3 p-3 border rounded-sm cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="payment" defaultChecked className="h-4 w-4 accent-black" />
                                <span>Credit Card</span>
                            </label>
                            <label className="flex items-center space-x-3 p-3 border rounded-sm cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="payment" className="h-4 w-4 accent-black" />
                                <span>Bank Transfer (Virtual Account)</span>
                            </label>
                            <label className="flex items-center space-x-3 p-3 border rounded-sm cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="payment" className="h-4 w-4 accent-black" />
                                <span>Naver Pay</span>
                            </label>
                        </div>
                    </section>
                </div>

                {/* Order Summary */}
                <div className="md:col-span-1">
                    <div className="sticky top-24 bg-gray-50 p-6 rounded-sm border">
                        <h3 className="font-bold mb-4 text-lg">Order Summary</h3>
                        <div className="flex justify-between items-start mb-4 pb-4 border-b">
                            <div className="flex-1">
                                <p className="font-medium text-sm">{PRODUCT_DATA.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">1:1 Premium Lesson</p>
                            </div>
                            <span className="font-bold">{PRODUCT_DATA.price.toLocaleString()}</span>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{PRODUCT_DATA.price.toLocaleString()} KRW</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="text-accent">-0 KRW</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-4 border-t">
                                <span>Total</span>
                                <span className="text-accent">{PRODUCT_DATA.price.toLocaleString()} KRW</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {isProcessing ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
