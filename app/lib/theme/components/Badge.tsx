'use client';

import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  children: React.ReactNode;
  className?: string;
}

const StyledBadge = styled.span<BadgeProps>`
  ${({ variant = 'primary', size = 'md', rounded }) => css`
    /* Base styles */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-primary);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    border-radius: ${rounded ? '9999px' : 'var(--radius-md)'};
    
    /* Size variants */
    ${size === 'sm' && css`
      font-size: var(--font-size-xs);
      padding: var(--spacing-1) var(--spacing-2);
    `}
    
    ${size === 'md' && css`
      font-size: var(--font-size-sm);
      padding: var(--spacing-1) var(--spacing-3);
    `}
    
    ${size === 'lg' && css`
      font-size: var(--font-size-base);
      padding: var(--spacing-2) var(--spacing-4);
    `}
    
    /* Variant styles */
    ${variant === 'primary' && css`
      background-color: var(--color-primary-100);
      color: var(--color-primary-800);
    `}
    
    ${variant === 'secondary' && css`
      background-color: var(--color-secondary-100);
      color: var(--color-secondary-800);
    `}
    
    ${variant === 'accent' && css`
      background-color: var(--color-accent-100);
      color: var(--color-accent-800);
    `}
    
    ${variant === 'success' && css`
      background-color: var(--color-success-100);
      color: var(--color-success-800);
    `}
    
    ${variant === 'warning' && css`
      background-color: var(--color-warning-100);
      color: var(--color-warning-800);
    `}
    
    ${variant === 'error' && css`
      background-color: var(--color-error-100);
      color: var(--color-error-800);
    `}
    
    ${variant === 'info' && css`
      background-color: var(--color-info-100);
      color: var(--color-info-800);
    `}
  `}
`;

export const Badge: React.FC<BadgeProps> = (props) => {
  return (
    <StyledBadge {...props} />
  );
};