import { AppBar, Grid, IconButton, Toolbar, Typography } from '@mui/material';
import { LogoutOutlined, MenuOutlined } from '@mui/icons-material';

// eslint-disable-next-line react/prop-types
export const NavBar = ({ drawerWidth }) => {
  return (
    <AppBar
        position='fixed'
        sx={{ 
        width: { sm: `calc(100% - ${ drawerWidth }px)` },
        ml: { sm: `${ drawerWidth }px` }
        }}
    >
        <Toolbar>
            <IconButton
                color='inherit'
                edge="start"
                sx={{ mr: 2, display: { sm: 'none' } }}
            >
                <MenuOutlined />
            </IconButton>
        </Toolbar>

        <Grid container direction='row' justifyContent='space-between' alignItems='center'>
            <Typography variant='h6' noWrap component='div'> JournalApp </Typography>

            <IconButton color='error'>
                <LogoutOutlined />
            </IconButton>
        </Grid>

    </AppBar>
  )
}
