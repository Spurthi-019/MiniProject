import { createTheme } from '@mui/material/styles';

// Colorful Vibrant Theme for Project Management System
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Royal blue
      light: '#60a5fa',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#a855f7', // Vibrant purple
      light: '#c084fc',
      dark: '#9333ea',
      contrastText: '#ffffff',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Gradient background
      paper: '#ffffff', // Clean white for cards
    },
    error: {
      main: '#ef4444', // Bright red
      light: '#fca5a5',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b', // Bright orange
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#06b6d4', // Cyan/Teal
      light: '#22d3ee',
      dark: '#0891b2',
    },
    success: {
      main: '#10b981', // Emerald green
      light: '#34d399',
      dark: '#059669',
    },
    text: {
      primary: '#1f2937', // Dark gray for text
      secondary: '#6b7280', // Medium gray
      disabled: '#9ca3af',
    },
    divider: '#e5e7eb',
    // Custom colors for variety
    custom: {
      pink: '#ec4899',
      indigo: '#6366f1',
      teal: '#14b8a6',
      amber: '#f59e0b',
      rose: '#f43f5e',
      lime: '#84cc16',
      sky: '#0ea5e9',
      violet: '#8b5cf6',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // Disable uppercase transformation
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // Smooth rounded corners
  },
  spacing: 8, // Consistent 8px spacing unit
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
        '*': {
          boxSizing: 'border-box',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '20px !important',
          paddingRight: '20px !important',
          '@media (min-width: 600px)': {
            paddingLeft: '24px !important',
            paddingRight: '24px !important',
          },
        },
        maxWidthXl: {
          maxWidth: '1400px !important',
        },
        maxWidthLg: {
          maxWidth: '1200px !important',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          height: '100%', // Equal height cards
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.25)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          flex: '1 0 auto', // Allow content to grow
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          justifyContent: 'flex-start',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorPrimary: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
        },
        colorSecondary: {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: '#ffffff',
        },
        colorSuccess: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
        },
        colorWarning: {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#ffffff',
        },
        colorError: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#ffffff',
        },
        colorInfo: {
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          color: '#ffffff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 10,
            '& fieldset': {
              borderColor: '#d1d5db',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: '#a855f7',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#e5e7eb',
          padding: '16px',
        },
        head: {
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        },
        body: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          border: '2px solid',
        },
        standardSuccess: {
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          color: '#065f46',
          borderColor: '#10b981',
        },
        standardError: {
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          color: '#991b1b',
          borderColor: '#ef4444',
        },
        standardWarning: {
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          color: '#92400e',
          borderColor: '#f59e0b',
        },
        standardInfo: {
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          color: '#1e3a8a',
          borderColor: '#3b82f6',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          height: 8,
        },
        bar: {
          borderRadius: 10,
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#667eea',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.08)',
          margin: '16px 0',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 8,
          '&:hover': {
            backgroundColor: 'rgba(102, 126, 234, 0.05)',
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        secondary: {
          fontSize: '0.75rem',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          minHeight: 48,
          padding: '12px 24px',
          '&.Mui-selected': {
            color: '#667eea',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '2px solid rgba(0, 0, 0, 0.08)',
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          padding: '12px 14px',
          borderRadius: 10,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          padding: '10px 16px',
          '&:hover': {
            backgroundColor: 'rgba(102, 126, 234, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(102, 126, 234, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.16)',
            },
          },
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        container: {
          margin: 0,
          width: '100%',
        },
        item: {
          display: 'flex',
        },
      },
    },
  },
});

export default theme;
