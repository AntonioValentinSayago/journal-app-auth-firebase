import { Toolbar } from '@mui/material';
import { Box } from '@mui/system'
import { NavBar } from '../components';
import SideBar from '../components/SideBar';

const drawerWidth = 280;

// eslint-disable-next-line react/prop-types
export const JournalLayout = ({ children }) => {
    return (
        <Box sx={{ display: 'flex' }}>

            {/* <NavBar drawerWidth={drawerWidth} /> */}
            <NavBar drawerWidth={drawerWidth} />

            {/* <SideBar drawerWidth={drawerWidth} /> */}
            <SideBar drawerWidth={drawerWidth} />
            <Box
                component='main'
                sx={{ flexGrow: 1, p: 3 }}
            >
                 <Toolbar /> 

                { children }

            </Box>
        </Box>
    )
}
