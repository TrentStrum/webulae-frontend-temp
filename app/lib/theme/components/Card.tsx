'use client';

import React, { forwardRef } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'bordered' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  isHoverable?: boolean;
}

const StyledCard = styled.div<CardProps>`
  ${({ variant = 'elevated', padding = 'md', isHoverable }) => css`
    /* Base styles */
    background-color: var(--color-background);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: all var(--transition-normal) var(--transition-timing);
    
    /* Variant styles */
    ${variant === 'elevated' && css`
      box-shadow: var(--shadow-md);
    `}
    
    ${variant === 'bordered' && css`
      border: 1px solid var(--color-border);
      box-shadow: none;
    `}
    
    ${variant === 'flat' && css`
      box-shadow: none;
    `}
    
    /* Padding styles */
    ${padding === 'none' && css`
      padding: 0;
    `}
    
    ${padding === 'sm' && css`
      padding: var(--spacing-3);
    `}
    
    ${padding === 'md' && css`
      padding: var(--spacing-5);
    `}
    
    ${padding === 'lg' && css`
      padding: var(--spacing-8);
    `}
    
    /* Hover effect */
    ${isHoverable && css`
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
    `}
  `}
`;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    return (
      <StyledCard ref={ref} {...props} />
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = styled.div`
  padding: var(--spacing-4) var(--spacing-5);
  border-bottom: 1px solid var(--color-border);
`;

export const CardTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
`;

export const CardDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-muted-foreground);
  margin: var(--spacing-1) 0 0;
`;

export const CardContent = styled.div`
  padding: var(--spacing-5);
`;

export const CardFooter = styled.div`
  padding: var(--spacing-4) var(--spacing-5);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-2);
`;