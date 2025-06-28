import { colors, typography, spacing, borderRadius, boxShadow, transitions } from './index';

// Component-specific theme configurations
export const components = {
  // Button variants
  button: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.md,
      transition: `all ${transitions.duration[200]} ${transitions.timing.inOut}`,
      cursor: 'pointer',
      outline: 'none',
      whiteSpace: 'nowrap',
    },
    variants: {
      primary: {
        backgroundColor: colors.primary[600],
        color: colors.neutral[100],
        '&:hover': {
          backgroundColor: colors.primary[700],
        },
        '&:focus': {
          boxShadow: `0 0 0 2px ${colors.primary[200]}`,
        },
      },
      secondary: {
        backgroundColor: colors.secondary[600],
        color: colors.neutral[100],
        '&:hover': {
          backgroundColor: colors.secondary[700],
        },
        '&:focus': {
          boxShadow: `0 0 0 2px ${colors.secondary[200]}`,
        },
      },
      accent: {
        backgroundColor: colors.accent[600],
        color: colors.neutral[100],
        '&:hover': {
          backgroundColor: colors.accent[700],
        },
        '&:focus': {
          boxShadow: `0 0 0 2px ${colors.accent[200]}`,
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: colors.primary[600],
        border: `1px solid ${colors.primary[600]}`,
        '&:hover': {
          backgroundColor: colors.primary[100],
        },
        '&:focus': {
          boxShadow: `0 0 0 2px ${colors.primary[200]}`,
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: colors.primary[600],
        '&:hover': {
          backgroundColor: colors.primary[100],
        },
        '&:focus': {
          boxShadow: `0 0 0 2px ${colors.primary[200]}`,
        },
      },
      link: {
        backgroundColor: 'transparent',
        color: colors.primary[600],
        padding: 0,
        height: 'auto',
        '&:hover': {
          textDecoration: 'underline',
        },
      },
      danger: {
        backgroundColor: colors.error[500],
        color: colors.neutral[100],
        '&:hover': {
          backgroundColor: colors.error[500],
        },
        '&:focus': {
          boxShadow: `0 0 0 2px ${colors.error[100]}`,
        },
      },
    },
    sizes: {
      xs: {
        fontSize: typography.fontSize.xs,
        height: spacing[6],
        padding: `0 ${spacing[2]}`,
      },
      sm: {
        fontSize: typography.fontSize.sm,
        height: spacing[8],
        padding: `0 ${spacing[3]}`,
      },
      md: {
        fontSize: typography.fontSize.base,
        height: spacing[10],
        padding: `0 ${spacing[4]}`,
      },
      lg: {
        fontSize: typography.fontSize.lg,
        height: spacing[12],
        padding: `0 ${spacing[6]}`,
      },
      xl: {
        fontSize: typography.fontSize.xl,
        height: spacing[16],
        padding: `0 ${spacing[8]}`,
      },
    },
  },

  // Card component
  card: {
    base: {
      backgroundColor: colors.neutral[100],
      borderRadius: borderRadius.lg,
      boxShadow: boxShadow.md,
      overflow: 'hidden',
    },
    variants: {
      elevated: {
        boxShadow: boxShadow.lg,
      },
      bordered: {
        border: `1px solid ${colors.neutral[300]}`,
        boxShadow: 'none',
      },
      flat: {
        boxShadow: 'none',
      },
    },
  },

  // Input component
  input: {
    base: {
      width: '100%',
      height: spacing[10],
      padding: `0 ${spacing[3]}`,
      backgroundColor: colors.neutral[100],
      border: `1px solid ${colors.neutral[300]}`,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.base,
      transition: `all ${transitions.duration[200]} ${transitions.timing.inOut}`,
      outline: 'none',
      '&:focus': {
        borderColor: colors.primary[500],
        boxShadow: `0 0 0 1px ${colors.primary[500]}`,
      },
      '&:disabled': {
        backgroundColor: colors.neutral[200],
        cursor: 'not-allowed',
      },
    },
    variants: {
      error: {
        borderColor: colors.error[500],
        '&:focus': {
          boxShadow: `0 0 0 1px ${colors.error[500]}`,
        },
      },
      success: {
        borderColor: colors.success[500],
        '&:focus': {
          boxShadow: `0 0 0 1px ${colors.success[500]}`,
        },
      },
    },
    sizes: {
      sm: {
        height: spacing[8],
        fontSize: typography.fontSize.sm,
        padding: `0 ${spacing[2]}`,
      },
      md: {
        height: spacing[10],
        fontSize: typography.fontSize.base,
        padding: `0 ${spacing[3]}`,
      },
      lg: {
        height: spacing[12],
        fontSize: typography.fontSize.lg,
        padding: `0 ${spacing[4]}`,
      },
    },
  },

  // Modal/Dialog component
  modal: {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    },
    content: {
      backgroundColor: colors.neutral[100],
      borderRadius: borderRadius.lg,
      boxShadow: boxShadow.xl,
      width: '100%',
      maxWidth: '32rem',
      maxHeight: 'calc(100vh - 2rem)',
      overflow: 'auto',
      padding: spacing[6],
    },
    sizes: {
      sm: {
        maxWidth: '24rem',
      },
      md: {
        maxWidth: '32rem',
      },
      lg: {
        maxWidth: '48rem',
      },
      xl: {
        maxWidth: '64rem',
      },
      full: {
        maxWidth: '100%',
        height: '100%',
        borderRadius: 0,
        margin: 0,
      },
    },
  },

  // Navigation
  navigation: {
    base: {
      display: 'flex',
      alignItems: 'center',
      padding: `${spacing[4]} 0`,
    },
    link: {
      color: colors.neutral[700],
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      padding: `${spacing[2]} ${spacing[3]}`,
      borderRadius: borderRadius.md,
      transition: `all ${transitions.duration[200]} ${transitions.timing.inOut}`,
      '&:hover': {
        backgroundColor: colors.neutral[200],
      },
      '&.active': {
        color: colors.primary[600],
        backgroundColor: colors.primary[100],
      },
    },
  },

  // Table component
  table: {
    base: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    head: {
      backgroundColor: colors.neutral[100],
    },
    header: {
      padding: spacing[3],
      textAlign: 'left',
      fontWeight: typography.fontWeight.semibold,
      borderBottom: `1px solid ${colors.neutral[300]}`,
    },
    body: {},
    row: {
      '&:hover': {
        backgroundColor: colors.neutral[100],
      },
      '&:not(:last-child)': {
        borderBottom: `1px solid ${colors.neutral[200]}`,
      },
    },
    cell: {
      padding: spacing[3],
    },
  },

  // Form elements
  form: {
    label: {
      display: 'block',
      marginBottom: spacing[1],
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.neutral[700],
    },
    helperText: {
      fontSize: typography.fontSize.xs,
      color: colors.neutral[600],
      marginTop: spacing[1],
    },
    errorText: {
      fontSize: typography.fontSize.xs,
      color: colors.error[500],
      marginTop: spacing[1],
    },
  },

  // Alert component
  alert: {
    base: {
      padding: spacing[4],
      borderRadius: borderRadius.md,
      display: 'flex',
      alignItems: 'flex-start',
    },
    variants: {
      info: {
        backgroundColor: colors.info[100],
        borderLeft: `4px solid ${colors.info[500]}`,
      },
      success: {
        backgroundColor: colors.success[100],
        borderLeft: `4px solid ${colors.success[500]}`,
      },
      warning: {
        backgroundColor: colors.warning[100],
        borderLeft: `4px solid ${colors.warning[500]}`,
      },
      error: {
        backgroundColor: colors.error[100],
        borderLeft: `4px solid ${colors.error[500]}`,
      },
    },
  },

  // Badge component
  badge: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.full,
      fontWeight: typography.fontWeight.medium,
      fontSize: typography.fontSize.xs,
      lineHeight: 1,
      whiteSpace: 'nowrap',
    },
    variants: {
      primary: {
        backgroundColor: colors.primary[100],
        color: colors.primary[800],
      },
      secondary: {
        backgroundColor: colors.secondary[100],
        color: colors.secondary[800],
      },
      accent: {
        backgroundColor: colors.accent[100],
        color: colors.accent[800],
      },
      success: {
        backgroundColor: colors.success[100],
        color: colors.success[900],
      },
      warning: {
        backgroundColor: colors.warning[100],
        color: colors.warning[900],
      },
      error: {
        backgroundColor: colors.error[100],
        color: colors.error[900],
      },
    },
    sizes: {
      sm: {
        height: spacing[5],
        padding: `0 ${spacing[2]}`,
      },
      md: {
        height: spacing[6],
        padding: `0 ${spacing[2]}`,
      },
      lg: {
        height: spacing[8],
        padding: `0 ${spacing[3]}`,
      },
    },
  },
};

export default components;