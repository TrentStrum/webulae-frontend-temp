import { useState, useEffect, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyComponentProps {
  children: ReactNode;
  height?: number | string;
  width?: number | string;
  threshold?: number;
  placeholder?: ReactNode;
}

export function LazyComponent({
  children,
  height = 200,
  width = '100%',
  threshold = 0.1,
  placeholder,
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold]);

  return (
    <div ref={setRef} style={{ minHeight: height, width }}>
      {isVisible ? (
        children
      ) : (
        placeholder || (
          <Skeleton
            style={{ height, width }}
            className="rounded-md"
          />
        )
      )}
    </div>
  );
}