import { Package, MapPin, User, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCT_DATA } from "@/lib/mockData";

export default function MyPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 space-y-2">
                    <div className="px-4 py-6 border rounded-sm bg-gray-50 mb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold">John Doe</p>
                                <p className="text-xs text-muted-foreground">Standard Member</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex flex-col space-y-1">
                        <Link href="/my" className="flex items-center gap-3 px-4 py-3 bg-secondary/50 font-medium rounded-sm">
                            <Package className="w-4 h-4" />
                            Orders
                        </Link>
                        <Link href="#" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-gray-50 rounded-sm">
                            <MapPin className="w-4 h-4" />
                            Addresses
                        </Link>
                        <Link href="#" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-gray-50 rounded-sm">
                            <Settings className="w-4 h-4" />
                            Settings
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-6">Order History</h1>

                    <div className="space-y-4">
                        {/* Mock Order Item */}
                        <div className="border rounded-sm p-6">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b">
                                <span className="font-bold text-lg">Order #ORD-2024-001</span>
                                <span className="text-sm text-muted-foreground">2024.02.10</span>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative w-24 h-24 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                                    <Image src={PRODUCT_DATA.images.main} alt="Product" fill className="object-cover" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold border border-green-600 text-green-600 px-1 rounded-sm">PAID</span>
                                        <h3 className="font-bold">{PRODUCT_DATA.title}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Option: 1:1 Private Lesson / 2 Hours (Morning) / Intermediate
                                    </p>
                                    <p className="font-bold text-lg">{PRODUCT_DATA.price.toLocaleString()} KRW</p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button className="px-4 py-2 border text-sm font-medium hover:bg-gray-50">View Invoice</button>
                                <button className="px-4 py-2 border text-sm font-medium hover:bg-gray-50">Write Review</button>
                                <button className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800">Track Order</button>
                            </div>
                        </div>

                        {/* Empty State Mock */}
                        <div className="border border-dashed rounded-sm p-12 text-center text-muted-foreground">
                            <p>No more orders found.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
