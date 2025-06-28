'use client';

import React, { forwardRef } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled';
  inputSize?: 'sm' | 'md' | 'lg';
  isError?: boolean;
  isSuccess?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  fullWidth?: boolean;
}

const InputWrapper = styled.div<{ fullWidth?: boolean }>`
  position: relative;
  display: inline-flex;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
`;

const StyledInput = styled.input<InputProps>`
  /* Base styles */
  font-family: var(--font-primary);
  background-color: var(--color-background);
  color: var(--color-foreground);
  border-radius: var(--radius-md);
  width: 100%;
  transition: all var(--transition-fast) var(--transition-timing);
  outline: none;
  
  &::placeholder {
    color: var(--color-muted-foreground);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Size variants */
  ${({ inputSize = 'md' }) => inputSize === 'sm' && css`
    font-size: var(--font-size-sm);
    height: var(--spacing-8);
    padding: 0 var(--spacing-3);
  `}
  
  ${({ inputSize = 'md' }) => inputSize === 'md' && css`
    font-size: var(--font-size-base);
    height: var(--spacing-10);
    padding: 0 var(--spacing-4);
  `}
  
  ${({ inputSize = 'md' }) => inputSize === 'lg' && css`
    font-size: var(--font-size-lg);
    height: var(--spacing-12);
    padding: 0 var(--spacing-5);
  `}
  
  /* Default variant styles */
  border: 1px solid var(--color-border);
  
  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 1px var(--color-primary);
  }
  
  /* Filled variant */
  ${({ variant }: { variant?: 'default' | 'filled' | 'flushed' | 'unstyled' }) => variant === 'filled' && css`
    border: 1px solid transparent;
    background-color: var(--color-muted);
    
    &:focus {
      background-color: var(--color-background);
      border-color: var(--color-primary);
    }
  `}
  
  /* Flushed variant */
  ${({ variant }: { variant?: 'default' | 'filled' | 'flushed' | 'unstyled' }) => variant === 'flushed' && css`
    border: none;
    border-bottom: 1px solid var(--color-border);
    border-radius: 0;
    padding-left: 0;
    padding-right: 0;
    background-color: transparent;
    
    &:focus {
      border-bottom-color: var(--color-primary);
      box-shadow: 0 1px 0 0 var(--color-primary);
    }
  `}
  
  /* Unstyled variant */
  ${({ variant }: { variant?: 'default' | 'filled' | 'flushed' | 'unstyled' }) => variant === 'unstyled' && css`
    border: none;
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
  `}
  
  /* State styles */
  ${({ isError }) => isError && css`
    border-color: var(--color-error) !important;
    
    &:focus {
      box-shadow: 0 0 0 1px var(--color-error) !important;
    }
  `}
  
  ${({ isSuccess }) => isSuccess && css`
    border-color: var(--color-success) !important;
    
    &:focus {
      box-shadow: 0 0 0 1px var(--color-success) !important;
    }
  `}
  
  /* Icon padding adjustments */
  ${({ leftElement, inputSize = 'md' }: { leftElement?: React.ReactNode, inputSize?: 'sm' | 'md' | 'lg' }) => leftElement !== undefined && leftElement !== null && css`
    padding-left: ${inputSize === 'sm' ? 'var(--spacing-8)' : inputSize === 'md' ? 'var(--spacing-10)' : 'var(--spacing-12)'};
  `}
  
  ${({ rightElement, inputSize = 'md' }: { rightElement?: React.ReactNode, inputSize?: 'sm' | 'md' | 'lg' }) => rightElement !== undefined && rightElement !== null && css`
    padding-right: ${inputSize === 'sm' ? 'var(--spacing-8)' : inputSize === 'md' ? 'var(--spacing-10)' : 'var(--spacing-12)'};
  `}
`;

const InputElement = styled.div<{ position: 'left' | 'right', inputSize?: 'sm' | 'md' | 'lg' }>`
  position: absolute;
  top: 0;
  ${props => props.position === 'left' ? 'left: 0;' : 'right: 0;'}
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-3);
  color: var(--color-muted-foreground);
  pointer-events: none;
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ leftElement, rightElement, fullWidth, inputSize, ...props }, ref) => {
    return (
      <InputWrapper fullWidth={fullWidth}>
        {leftElement && (
          <InputElement position="left" inputSize={inputSize}>
            {leftElement}
          </InputElement>
        )}
        
        <StyledInput
          ref={ref}
          inputSize={inputSize}
          leftElement={leftElement}
          rightElement={rightElement}
          {...props}
        />
        
        {rightElement && (
          <InputElement position="right" inputSize={inputSize}>
            {rightElement}
          </InputElement>
        )}
      </InputWrapper>
    );
  }
);

Input.displayName = 'Input';