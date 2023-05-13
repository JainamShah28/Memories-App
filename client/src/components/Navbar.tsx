import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { logout } from '../actions/users';

import { RootState, AppDispatch } from '../index';

import { AppBar, Toolbar, Typography, Button, Stack, styled, Avatar } from '@mui/material';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    position: "sticky",
    top: "16px",
})),
    StyledToolbar = styled(Toolbar)({
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    });

const Navbar: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.users),
        dispatch = useDispatch<AppDispatch>(),
        navigate = useNavigate();

    const goToAuth = () => {
        navigate('/auth');
    };

    const logOutUser = async () => {
        try {
            const response = await fetch('http://localhost:5000/users/logOut', {
                method: 'GET',
                credentials: 'include'
            });

            return response.json(); 
        } catch (error) {
            console.log(error); 
        }
    }; 

    const handleLogOut = () => {
        logOutUser().then((data) => {
            if (data.success) {
                dispatch(logout());
            }
        }).catch((error) => {
            console.log(error); 
        });
    };

    return (
        <StyledAppBar>
            <StyledToolbar>
                <Typography
                    variant="h6"
                    component={Link}
                    to='/'
                    sx={{
                        color: "white",
                        textDecoration: "none"
                    }}
                >Memories</Typography>

                {
                    user.userName !== "" ?
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Stack direction="row" justifyContent="start" alignItems="center" spacing={0.80}>
                                <Avatar
                                    alt={user.userName}
                                    src={user.profilePicture}
                                    sx={{
                                        backgroundColor: "purple"
                                    }}
                                >{user.userName.charAt(0)}</Avatar>

                                <Typography>{user.userName}</Typography>
                            </Stack>

                            <Button color="inherit" onClick={handleLogOut}>logout</Button>
                        </Stack> :
                        <Button color="inherit" onClick={goToAuth}>sign in</Button>
                }
            </StyledToolbar>
        </StyledAppBar>
    );
};

export default Navbar; 