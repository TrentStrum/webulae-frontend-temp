'use client';

import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline' | 'subtitle1' | 'subtitle2';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  noMargin?: boolean;
  gutterBottom?: boolean;
  truncate?: boolean;
  children: React.ReactNode;
  className?: string;
}

const StyledTypography = styled.p<TypographyProps>`
  ${({ variant, align, color, weight, transform, noMargin, gutterBottom, truncate }) => css`
    /* Base styles */
    margin: ${noMargin ? '0' : gutterBottom ? '0 0 0.5em 0' : '0 0 0.25em 0'};
    text-align: ${align || 'inherit'};
    text-transform: ${transform || 'none'};
    color: ${color ? `var(--color-${color})` : 'inherit'};
    
    /* Truncate text if specified */
    ${truncate && css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
    
    /* Variant styles */
    ${variant === 'h1' && css`
      font-family: var(--font-primary);
      font-size: var(--font-size-5xl);
      font-weight: ${weight ? `var(--font-weight-${weight})` : 'var(--font-weight-bold)'};
      line-height: var(--line-height-tight);
      letter-spacing: var(--letter-spacing-tight);
    `}
    
    ${variant === 'h2' && css`
      font-family: var(--font-primary);
      font-size: var(--font-size-4xl);
      font-weight: ${weight ? `var(--font-weight-${weight})` : 'var(--font-weight-bold)'};
      line-height: var(--line-height-tight);
      letter-spacing: var(--letter-spacing-tight);
    `}
    
    ${variant === 'h3' && css`
      font-family: var(--font-primary);
      font-size: var(--font-size-3xl);
      font-weight: ${weight ? `var(--font-weight-${weight})` : 'var(--font-weight-semibold)'};
      line-height: var(--line-height-tight);
    `}
    
    ${variant === 'h4' && css`
      font-family: var(--font-primary);
      font-size: var(--font-size-2xl);
      font-weight: ${weight ? `var(--font-weight-${weight})` : 'var(--font-weight-semibold)'};
      line-height: var(--line-height-tight);
    `}
    
    ${variant === 'h5' && css`
      font-family: var(--font-primary);
      font-size: var(--font-size-xl);
      font-weight: ${weight ? `var(--font-weight-${weight})` : 'var(--font-weight-semibold)'};
      line-height: var(--line-height-tight);
    `}
    
    ${variant === 'h6' && css`
      font-family: var(--font-primary);
      font-size: var(--font-size-lg);
      font-weight: ${weight ? `var(--font-weight-${weight})` : 'var(--font-weight-semibold)'};
      line-height: var(--line-height-tight);
    `}
    
    ${variant === 'body1' && css`
      font-family: var(--font-secondary);
      font-size: var(--font-size-base);
      font-weight: ${weight ? `var(--font-weight-${weight})` : 'var(--font-weight-normal)'};
      line-height: var(--line-height-normal);
    `}
    
    ${variant === 'body2' && css`
      font-family: var(--font-secondary);
      font-size: var(--font-size-sm);
      font-weight: ${weight ? `var(--font-weight-${weight})` : 'var(--font-weight-normal)'};
      line-height: var(--line-height-normal);
    `}
    
    ${variant === 'caption' && css`
      font-family: var(--font-secondary);
      font-size: var(--font-size-xs);
      font-weight: ${weight ? `var(--font-weight-${weight})` : 'var(--font-weight-normal)'};
      line-height: var(--line-height-normal);
      color: ${color ? `var(--color-${color})` : 'var(--color-muted-foreground)'};
    `}
    
    ${variant === 'overline' && css`
      font-family: var(--font-secondary);
      font-size: var(--font-size-xs);
      font-weight: ${weight ? `var(--font-weight-${weight})` : 'var(--font-weight-medium)'};
      line-height: var(--line-height-normal);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: ${transform || 'uppercase'};
    `}
    
    ${variant === 'subtitle1' && css`
      font-family: var(--font-secondary);
      font-size: var(--font-size-lg);
      font-weight: ${weight ? `var(--font-weight-${weight})` : 'var(--font-weight-medium)'};
      line-height: var(--line-height-normal);
    `}
    
    ${variant === 'subtitle2' && css`
      font-family: var(--font-secondary);
      font-size: var(--font-size-base);
      font-weight: ${weight ? `var(--font-weight-${weight})` : 'var(--font-weight-medium)'};
      line-height: var(--line-height-normal);
    `}
    
    /* Default styles if no variant is specified */
    ${!variant && css`
      font-family: var(--font-secondary);
      font-size: var(--font-size-base);
      font-weight: ${weight ? `var(--font-weight-${weight})` : 'var(--font-weight-normal)'};
      line-height: var(--line-height-normal);
    `}
  `}
`;

export const Typography: React.FC<TypographyProps & { as?: React.ElementType }> = ({
  variant,
  as,
  children,
  ...props
}) => {
  // Determine the HTML element based on the variant or the 'as' prop
  const Component = as || 
    (variant?.startsWith('h') ? variant : 
      variant === 'body1' || variant === 'body2' ? 'p' : 
      variant === 'caption' || variant === 'overline' ? 'span' : 
      variant === 'subtitle1' || variant === 'subtitle2' ? 'h6' : 
      'p') as React.ElementType;
  
  return (
    <StyledTypography
      as={Component}
      variant={variant}
      {...props}
    >
      {children}
    </StyledTypography>
  );
};

// Convenience components
export const Heading1 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h1" {...props} />
);

export const Heading2 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h2" {...props} />
);

export const Heading3 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h3" {...props} />
);

export const Heading4 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h4" {...props} />
);

export const Heading5 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h5" {...props} />
);

export const Heading6 = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="h6" {...props} />
);

export const Text = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body1" {...props} />
);

export const SmallText = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body2" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="caption" {...props} />
);