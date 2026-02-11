import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccessPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-green-100 p-6 rounded-full mb-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
                Thank you for your purchase. We have received your order and will contact you shortly to confirm the lesson schedule.
            </p>
            <div className="flex gap-4">
                <Link href="/my" className="px-6 py-3 border border-black font-medium hover:bg-gray-50 transition-colors">
                    View My Orders
                </Link>
                <Link href="/" className="px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}
