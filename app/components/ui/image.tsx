import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export interface ImageProps extends Omit<NextImageProps, 'alt'> {
  alt: string;
  className?: string;
}

const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ alt, className, ...props }, ref) => {
    return (
      <NextImage
        ref={ref}
        alt={alt}
        className={cn('transition-opacity duration-300', className)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...props}
      />
    );
  }
);

Image.displayName = 'Image';

export { Image };