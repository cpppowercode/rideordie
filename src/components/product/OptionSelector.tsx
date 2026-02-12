'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRODUCT_DATA } from '@/lib/mockData';



export function OptionSelector() {
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);

    const handleSelect = (optionName: string, value: string) => {
        setSelections(prev => ({ ...prev, [optionName]: value }));
        setIsDropdownOpen(null);
    };



    const allSelected = PRODUCT_DATA.options.every(opt => selections[opt.name]);

    const router = useRouter();

    const handleBuyNow = () => {
        if (!allSelected) {
            alert("구매 전 모든 옵션을 선택해주세요.");
            return;
        }
        // In a real app, we'd pass the selection state to checkout via Context or URL params.
        // For this mock, we just go to checkout.
        router.push('/checkout');
    };

    return (
        <div className="space-y-4">
            {PRODUCT_DATA.options.map((option) => (
                <div key={option.id} className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(isDropdownOpen === option.id ? null : option.id)}
                        className="w-full flex items-center justify-between p-3 border rounded-sm bg-white hover:bg-gray-50 text-left transition-colors"
                    >
                        <span className={cn("text-sm", !selections[option.name] && "text-muted-foreground")}>
                            {selections[option.name] || option.name}
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>

                    {isDropdownOpen === option.id && (
                        <div className="absolute z-10 w-full mt-1 bg-white border shadow-lg rounded-sm max-h-60 overflow-auto">
                            {option.values.map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleSelect(option.name, val)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 flex items-center justify-between group"
                                >
                                    {val}
                                    {selections[option.name] === val && <Check className="h-3 w-3 text-accent" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {/* Selected Items Summary */}
            {allSelected && (
                <div className="bg-secondary/30 p-4 rounded-sm border border-secondary">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium">
                            {Object.values(selections).join(' / ')}
                        </div>
                        <button onClick={() => setSelections({})} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-gray-300">
                        <div className="flex items-center gap-2">
                            <button className="w-6 h-6 border flex items-center justify-center bg-white hover:bg-gray-50">-</button>
                            <span className="text-sm font-medium w-4 text-center">1</span>
                            <button className="w-6 h-6 border flex items-center justify-center bg-white hover:bg-gray-50">+</button>
                        </div>
                        <div className="text-lg font-bold">
                            {PRODUCT_DATA.price.toLocaleString()} 원
                        </div>
                    </div>
                </div>
            )}

            {/* Total Price & Action Buttons */}
            <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-muted-foreground">총 상품금액 (1개)</span>
                    <span className="text-2xl font-bold text-accent">
                        {allSelected ? PRODUCT_DATA.price.toLocaleString() : 0} 원
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button className="py-4 border border-black font-bold uppercase tracking-wide hover:bg-gray-50 transition-colors">
                        장바구니 담기
                    </button>
                    <button
                        onClick={handleBuyNow}
                        className="py-4 bg-accent text-white font-bold uppercase tracking-wide hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
                    >
                        바로 구매
                    </button>
                </div>
            </div>
        </div>
    );
}
