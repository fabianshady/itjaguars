import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0d47a1',
    },
    secondary: {
      main: '#d32f2f',
    },
    success: {
      main: '#2e7d32', // Verde fuerte para success
    },
    error: {
      main: '#c62828', // Rojo fuerte para error
    },
    warning: {
      main: '#f9a825', // Amarillo fuerte para warning
    },
    info: {
      main: '#ffb300',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#0d1b2a',
      secondary: '#415a77',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: 'gradient' },
          style: {
            borderRadius: 30,
            paddingLeft: 20,
            paddingRight: 20,
            fontWeight: 700,
            backgroundImage: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #42a5f5 100%)',
            backgroundSize: '200% 100%',
            backgroundPosition: 'left center',
            color: '#ffffff',
            transition: 'all 0.4s ease',
            '&:hover': {
              backgroundPosition: 'right center',
              backgroundImage: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #0d47a1 100%)',
              boxShadow: '0 6px 15px rgba(21, 101, 192, 0.4)',
            },
          },
        },
        {
          props: { variant: 'outlined' },
          style: {
            borderRadius: 30,
            paddingLeft: 20,
            paddingRight: 20,
            fontWeight: 700,
            border: '2px solid #0d47a1',
            color: '#0d47a1',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: '#e3f2fd',
              borderColor: '#1565c0',
            },
          },
        },
        {
          props: { variant: 'contained' },
          style: {
            borderRadius: 30,
            paddingLeft: 20,
            paddingRight: 20,
            fontWeight: 700,
            backgroundColor: '#0d47a1',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#08306b',
              boxShadow: '0 6px 15px rgba(13, 71, 161, 0.4)',
            },
          },
        },
      ],
    },
    MuiChip: {
      variants: [
        {
          props: { color: 'primary' },
          style: {
            borderRadius: 20,
            fontWeight: 500,
            fontSize: '0.9rem',
            backgroundImage: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
            backgroundSize: '200% 100%',
            backgroundPosition: 'left center',
            color: '#ffffff',
            padding: '0 8px',
            transition: 'all 0.4s ease',
            '&:hover': {
              backgroundPosition: 'right center',
              boxShadow: '0 4px 10px rgba(66, 165, 245, 0.4)',
            },
          },
        },
        {
          props: { color: 'success' },
          style: {
            borderRadius: 20,
            fontWeight: 500,
            fontSize: '0.9rem',
            backgroundImage: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
            backgroundSize: '200% 100%',
            backgroundPosition: 'left center',
            color: '#ffffff',
            padding: '0 8px',
            '&:hover': {
              backgroundPosition: 'right center',
              boxShadow: '0 4px 10px rgba(102, 187, 106, 0.4)',
            },
          },
        },
        {
          props: { color: 'error' },
          style: {
            borderRadius: 20,
            fontWeight: 500,
            fontSize: '0.9rem',
            backgroundImage: 'linear-gradient(135deg, #c62828 0%, #ef5350 100%)',
            backgroundSize: '200% 100%',
            backgroundPosition: 'left center',
            color: '#ffffff',
            padding: '0 8px',
            '&:hover': {
              backgroundPosition: 'right center',
              boxShadow: '0 4px 10px rgba(239, 83, 80, 0.4)',
            },
          },
        },
        {
          props: { color: 'warning' },
          style: {
            borderRadius: 20,
            fontWeight: 500,
            fontSize: '0.9rem',
            backgroundImage: 'linear-gradient(135deg, #f9a825 0%, #ffb300 100%)',
            backgroundSize: '200% 100%',
            backgroundPosition: 'left center',
            color: '#ffffff',
            padding: '0 8px',
            '&:hover': {
              backgroundPosition: 'right center',
              boxShadow: '0 4px 10px rgba(255, 179, 0, 0.4)',
            },
          },
        },
      ],
    },
  },
});

export default theme;
