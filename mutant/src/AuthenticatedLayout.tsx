import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AppFooter from './components/AppFooter';
// import SideBar, { type MenuItem } from './components/Shared/SideBar3';
import SideBar, { type MenuItem } from './components/Shared/SideBar5';
// import SideBarWrapper from './components/Shared/SideBarWrapper';

interface AuthenticatedLayoutProps {
  userName: string;
  menuItems: MenuItem[];
  appTitle: string;
  onLogout: () => void;
  children: React.ReactNode; // Для <Routes />
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  userName,
  menuItems,
  appTitle,
  onLogout,
  children,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        position: 'relative'
      }}
    >
      {/* Хедер */}
      {false &&<Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.paper',
          zIndex: 1100,
          height: '64px'
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          {appTitle}
        </Typography>

        <Box display="flex" alignItems="center">
          <Typography variant="body1" sx={{ mr: 2 }}>
            {userName}
          </Typography>
          <Button onClick={onLogout} variant="contained">
            Вийти
          </Button>
        </Box>
      </Box> }

      {/* Основная область */}
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          // mt: '64px',
          mb: '50px',
          // height: 'calc(100% - 114px)', // 64px header + 50px footer
          height: 'calc(100% - 50px)', // 50px footer
          position: 'relative'
        }}
      >
        {/* <SideBarWrapper */}
        <SideBar
          menuItems={menuItems}
          drawerTitle={'People Counting' /* Меню */}
          // drawerTitleKey={'People Counting' /* Меню */}
        />
        <Box
          component="main"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            width: '100%',
            position: 'relative'
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              maxWidth: () => ({ xs: '100%', sm: '600px', md: '900px', lg: '1200px' }),
              margin: '0 auto',
              // padding: theme => ({
              //   xs: theme.spacing(2),
              //   sm: theme.spacing(3),
              //   md: theme.spacing(4)
              // }),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              minWidth: 0,
              overflowY: 'auto'
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>

      {/* Футер */}
      <Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.paper',
          zIndex: 1100,
          height: '50px'
        }}
      >
        <AppFooter />
      </Box>
    </Box>
  );
};

export default AuthenticatedLayout;