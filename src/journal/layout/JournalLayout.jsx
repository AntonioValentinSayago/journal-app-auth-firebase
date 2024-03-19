//import { Toolbar } from '@mui/material';
import { Box } from '@mui/system'

const drawerWidth = 280;

// eslint-disable-next-line react/prop-types
export const JournalLayout = ({ children }) => {
    return (
        <Box sx={{ display: 'flex' }}>

            {/* <NavBar drawerWidth={drawerWidth} /> */}

            {/* <SideBar drawerWidth={drawerWidth} /> */}

            <Box
                component='main'
                sx={{ flexGrow: 1, p: 3 }}
            >
                {/* <Toolbar /> */}

                { children }

            </Box>
        </Box>
    )
}
