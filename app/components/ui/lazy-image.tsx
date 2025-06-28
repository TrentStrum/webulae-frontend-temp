import { useState, useEffect } from 'react';
import { Image, ImageProps } from '@/components/ui/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyImageProps extends ImageProps {
  lowQualitySrc?: string;
  loadingHeight?: number;
}

export function LazyImage({
  src,
  alt,
  className,
  lowQualitySrc,
  loadingHeight = 200,
  ...props
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);

  useEffect(() => {
    // If we have a low quality source, we'll show that first
    if (lowQualitySrc) {
      setCurrentSrc(lowQualitySrc);
      
      // Then load the high quality image
      const img = new window.Image();
      img.src = src as string;
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoading(false);
      };
    } else {
      setCurrentSrc(src);
    }
  }, [src, lowQualitySrc]);

  return (
    <div className="relative">
      {isLoading && (
        <Skeleton 
          className={cn("absolute inset-0 z-10", isLoading ? "opacity-100" : "opacity-0")}
          style={{ height: loadingHeight }}
        />
      )}
      <Image
        src={currentSrc}
        alt={alt}
        className={cn(
          className,
          "transition-opacity duration-500",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
}