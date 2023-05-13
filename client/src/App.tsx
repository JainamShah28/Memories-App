import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from './index';

import { getAuthStatus } from './actions/users';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import Auth from './pages/Auth';
import PostDetails from './pages/PostDetails';

import { Box, Container } from '@mui/material';

const App: React.FC = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.users),
        dispatch = useDispatch<AppDispatch>();

    React.useEffect(() => {
        dispatch(getAuthStatus());
    }, [dispatch]);

    return (
        <Box
            minHeight="100vh"
            sx={{
                backgroundColor: "#eceff1"
            }}
            paddingTop={2}
        >
            <Container maxWidth="xl">
                <Navbar />

                <Routes>
                    <Route
                        path='/'
                        element={<Navigate to='/posts' />}
                    />

                    <Route
                        path='/posts'
                        element={<Home />}
                    />

                    <Route
                        path='/posts/serach'
                        element={<Home />}
                    />

                    <Route 
                        path='/posts/:postID'
                        element={<PostDetails />}
                    />

                    <Route
                        path='/auth'
                        element={!isAuthenticated ? <Auth /> : <Navigate to='/' />}
                    />
                </Routes>
            </Container>
        </Box >
    );
};

export default App; 