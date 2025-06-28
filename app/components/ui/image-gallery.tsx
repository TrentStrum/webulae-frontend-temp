import React, { useState } from 'react';
import { LazyImage } from '@/components/ui/lazy-image';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  className?: string;
}

// Separate component for the actual gallery functionality
function ImageGalleryContent({ images, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative rounded-lg overflow-hidden aspect-video">
        <LazyImage
          src={images[selectedIndex].src}
          alt={images[selectedIndex].alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 transition-all",
                selectedIndex === index ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
              )}
              aria-label={`View ${image.alt}`}
              aria-current={selectedIndex === index}
            >
              <LazyImage
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  if (!images.length) return null;

  return <ImageGalleryContent images={images} className={className} />;
}