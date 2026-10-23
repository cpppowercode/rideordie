'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PRODUCT_DATA } from '@/lib/mockData';

export function ProductImageGallery() {
    const [selectedImage, setSelectedImage] = useState<string>(PRODUCT_DATA.images.main);

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-snow">
                <Image
                    src={selectedImage}
                    alt="Product Main"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    quality={85}
                    className="object-cover object-center"
                    priority
                />
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                <button
                    onClick={() => setSelectedImage(PRODUCT_DATA.images.main)}
                    className={cn(
                        "relative aspect-square overflow-hidden rounded-xl border-2",
                        selectedImage === PRODUCT_DATA.images.main ? "border-brand" : "border-transparent hover:border-line"
                    )}
                >
                    <Image src={PRODUCT_DATA.images.main} alt="Main Thumb" fill sizes="80px" className="object-cover" />
                </button>

                {PRODUCT_DATA.images.sub.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={cn(
                            "relative aspect-square overflow-hidden rounded-xl border-2",
                            selectedImage === img ? "border-brand" : "border-transparent hover:border-line"
                        )}
                    >
                        <Image src={img} alt={`Sub Thumb ${idx}`} fill sizes="80px" className="object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}
