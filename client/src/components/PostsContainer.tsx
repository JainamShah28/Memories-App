import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../index';

import { Box, Grid, Skeleton, Card, Stack } from '@mui/material';

import PostCard from './PostCard';

interface PostsContainerProps {
    setCurrentPost?: React.Dispatch<React.SetStateAction<number | null>>
};

const PostsContainer: React.FC<PostsContainerProps> = ({ setCurrentPost }) => {
    const { isLoading, posts } = useSelector((state: RootState) => state.posts);

    return (
        !isLoading ?
            <Box
                flex={3}
            >
                <Grid
                    container
                    spacing={2}
                >
                    {
                        posts.map((post, index) => (
                            <Grid
                                item
                                xs={12} sm={4}
                                key={index}
                            >
                                <PostCard
                                    post={post}
                                    setCurrentPost={setCurrentPost}
                                />
                            </Grid>
                        ))
                    }
                </Grid>
            </Box> :
            <Box
                flex={3}
            >
                <Grid
                    container
                    spacing={2}
                >
                    {
                        [1, 2, 3, 4, 5, 6].map((item) => (
                            <Grid
                                item
                                xs={12} sm={4}
                                key={item}
                            >
                                <Card>
                                    <Stack
                                        direction="column"
                                        sx={{
                                            padding: "8px 12px"
                                        }}
                                    >
                                        <Skeleton variant="text" sx={{ fontSize: '1.125rem' }} width="40%"></Skeleton>
                                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="20%"></Skeleton>
                                    </Stack>

                                    <Skeleton variant="rectangular" height={150} ></Skeleton>

                                    <Stack
                                        direction="column"
                                        sx={{
                                            padding: "8px 12px"
                                        }}
                                    >
                                        <Skeleton variant="text" sx={{ fontSize: '1.125rem' }} width="60%"></Skeleton>

                                        <Stack
                                            direction="column"
                                            sx={{
                                                marginTop: 2
                                            }}
                                            gap={0.5}
                                        >
                                            <Skeleton variant="text" sx={{ fontSize: '0.8rem' }}></Skeleton>
                                            <Skeleton variant="text" sx={{ fontSize: '0.8rem' }}></Skeleton>
                                            <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} width="80%"></Skeleton>
                                        </Stack>

                                        <Skeleton variant="text" sx={{ 
                                            fontSize: '1rem',
                                            marginTop: 2
                                        }} width="30%"></Skeleton>
                                    </Stack>
                                </Card>
                            </Grid>
                        ))
                    }
                </Grid>
            </Box>
    );
};

export default PostsContainer; 