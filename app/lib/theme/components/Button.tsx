'use client';

import React, { forwardRef } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'link' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const StyledButton = styled.button<ButtonProps>`
  ${({ variant = 'primary', size = 'md', fullWidth, disabled, loading }) => css`
    /* Base styles */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-primary);
    font-weight: var(--font-weight-medium);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast) var(--transition-timing);
    cursor: ${disabled || loading ? 'not-allowed' : 'pointer'};
    outline: none;
    white-space: nowrap;
    width: ${fullWidth ? '100%' : 'auto'};
    opacity: ${disabled ? 0.6 : 1};
    
    /* Size variants */
    ${size === 'xs' && css`
      font-size: var(--font-size-xs);
      height: var(--spacing-6);
      padding: 0 var(--spacing-2);
    `}
    
    ${size === 'sm' && css`
      font-size: var(--font-size-sm);
      height: var(--spacing-8);
      padding: 0 var(--spacing-3);
    `}
    
    ${size === 'md' && css`
      font-size: var(--font-size-base);
      height: var(--spacing-10);
      padding: 0 var(--spacing-4);
    `}
    
    ${size === 'lg' && css`
      font-size: var(--font-size-lg);
      height: var(--spacing-12);
      padding: 0 var(--spacing-6);
    `}
    
    ${size === 'xl' && css`
      font-size: var(--font-size-xl);
      height: var(--spacing-16);
      padding: 0 var(--spacing-8);
    `}
    
    /* Variant styles */
    ${variant === 'primary' && css`
      background-color: var(--color-primary);
      color: var(--color-primary-foreground);
      
      &:hover:not(:disabled) {
        background-color: var(--color-primary-700);
      }
      
      &:focus-visible {
        box-shadow: 0 0 0 2px var(--color-primary-300);
      }
    `}
    
    ${variant === 'secondary' && css`
      background-color: var(--color-secondary);
      color: var(--color-secondary-foreground);
      
      &:hover:not(:disabled) {
        background-color: var(--color-secondary-700);
      }
      
      &:focus-visible {
        box-shadow: 0 0 0 2px var(--color-secondary-300);
      }
    `}
    
    ${variant === 'accent' && css`
      background-color: var(--color-accent);
      color: var(--color-accent-foreground);
      
      &:hover:not(:disabled) {
        background-color: var(--color-accent-700);
      }
      
      &:focus-visible {
        box-shadow: 0 0 0 2px var(--color-accent-300);
      }
    `}
    
    ${variant === 'outline' && css`
      background-color: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      
      &:hover:not(:disabled) {
        background-color: var(--color-primary-50);
      }
      
      &:focus-visible {
        box-shadow: 0 0 0 2px var(--color-primary-200);
      }
    `}
    
    ${variant === 'ghost' && css`
      background-color: transparent;
      color: var(--color-primary);
      
      &:hover:not(:disabled) {
        background-color: var(--color-primary-50);
      }
      
      &:focus-visible {
        box-shadow: 0 0 0 2px var(--color-primary-200);
      }
    `}
    
    ${variant === 'link' && css`
      background-color: transparent;
      color: var(--color-primary);
      padding: 0;
      height: auto;
      
      &:hover:not(:disabled) {
        text-decoration: underline;
      }
    `}
    
    ${variant === 'danger' && css`
      background-color: var(--color-error-500);
      color: var(--color-neutral-100);
      
      &:hover:not(:disabled) {
        background-color: var(--color-error-600);
      }
      
      &:focus-visible {
        box-shadow: 0 0 0 2px var(--color-error-200);
      }
    `}
  `}
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  margin-right: 0.5em;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <StyledButton ref={ref} loading={loading} disabled={loading || props.disabled} {...props}>
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && <span style={{ marginRight: '0.5em' }}>{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span style={{ marginLeft: '0.5em' }}>{rightIcon}</span>}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';