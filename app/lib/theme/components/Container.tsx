'use client';

import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

export interface ContainerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  centered?: boolean;
  children: React.ReactNode;
  className?: string;
}

const StyledContainer = styled.div<ContainerProps>`
  ${({ size = 'lg', padding = true, centered = true }) => css`
    /* Base styles */
    width: 100%;
    margin-left: ${centered ? 'auto' : '0'};
    margin-right: ${centered ? 'auto' : '0'};
    padding-left: ${padding ? 'var(--spacing-4)' : '0'};
    padding-right: ${padding ? 'var(--spacing-4)' : '0'};
    
    /* Size variants */
    ${size === 'xs' && css`
      max-width: 20rem;
    `}
    
    ${size === 'sm' && css`
      max-width: 24rem;
    `}
    
    ${size === 'md' && css`
      max-width: 28rem;
    `}
    
    ${size === 'lg' && css`
      max-width: 32rem;
    `}
    
    ${size === 'xl' && css`
      max-width: 36rem;
    `}
    
    ${size === '2xl' && css`
      max-width: 42rem;
    `}
    
    ${size === 'full' && css`
      max-width: none;
    `}
    
    /* Responsive padding */
    @media (min-width: 768px) {
      padding-left: ${padding ? 'var(--spacing-6)' : '0'};
      padding-right: ${padding ? 'var(--spacing-6)' : '0'};
    }
  `}
`;

export const Container: React.FC<ContainerProps> = (props) => {
  return (
    <StyledContainer {...props} />
  );
};