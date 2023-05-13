import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';

import { AppDispatch, RootState } from '../index';

import { getPostByID, getPostsBySerach } from '../actions/posts';

import { Paper, Typography, Stack, Box, Skeleton, Divider, Grid, Card } from '@mui/material';

import PostCard from '../components/PostCard';

const PostDetails: React.FC = () => {
    const { isLoading, post, posts } = useSelector((state: RootState) => state.posts),
        dispatch = useDispatch<AppDispatch>(),
        navigate = useNavigate(),
        { postID } = useParams(),
        recommendedPosts = posts.filter((post) => Number(post.postID) !== Number(postID));

    React.useEffect(() => {
        dispatch(getPostByID(Number(postID)));
    }, [dispatch, postID]);

    React.useEffect(() => {
        dispatch(getPostsBySerach({
            search: "",
            tags: post.tags.join(",")
        }));
    }, [dispatch, post]);

    return (
        <Paper
            sx={{
                marginTop: 2
            }}
        >
            <Stack
                direction={{ sm: "column", md: "row-reverse" }}
                padding={2}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 2,
                    width: "100%"
                }}
            >
                <Box
                    width={{ sm: "100%", md: "40%" }}
                >
                    {
                        isLoading ?
                            <Skeleton variant="rectangular" width="100%" height="350px" sx={{
                                borderRadius: 12
                            }}></Skeleton> :
                            <img src={post.selectedFile} alt="post" width="100%" style={{
                                borderRadius: 12
                            }}></img>
                    }
                </Box>

                <Box
                    width={{ sm: "100%", md: "50%" }}
                >
                    {
                        isLoading ?
                            <Skeleton variant="text" width="30%" sx={{
                                fontSize: '2rem'
                            }}></Skeleton> :
                            <Typography variant="h4" sx={{ marginBottom: 0.5 }}>{post.title}</Typography>
                    }

                    {
                        isLoading ?
                            <Skeleton variant="text" width="40%" sx={{
                                fontSize: '1.125rem'
                            }}></Skeleton> :
                            post.tags.length !== 0 &&
                            <Typography variant="h6" fontSize={14} color="GrayText">
                                {
                                    post.tags.map((tag) => {
                                        return `#${tag} `
                                    })
                                }
                            </Typography>
                    }

                    {
                        isLoading ?
                            <Stack
                                direction="column"
                                sx={{
                                    margin: '14px 0',
                                }}
                                gap={0.5}
                            >
                                <Skeleton variant="text" sx={{
                                    fontSize: '1.10rem',
                                    width: '70%'
                                }}></Skeleton>

                                <Skeleton variant="text" sx={{
                                    fontSize: '1.10rem',
                                    width: '70%'
                                }}></Skeleton>

                                <Skeleton variant="text" sx={{
                                    fontSize: '1.10rem',
                                    width: '50%'
                                }}></Skeleton>
                            </Stack> :
                            <Typography variant="body1" sx={{ margin: "14px 0" }}>{post.message}</Typography>
                    }

                    {
                        isLoading ?
                            <Skeleton variant="text" sx={{
                                width: '40%',
                                fontSize: 18
                            }}></Skeleton> :
                            <Typography fontSize={18}>Created By: {post.creator.userName}</Typography>
                    }

                    {
                        isLoading ?
                            <Skeleton variant="text" sx={{
                                width: '20%',
                                fontSize: 12
                            }}></Skeleton> :
                            <Typography fontSize={12}>{moment(post.createdAt).fromNow()}</Typography>
                    }
                </Box>
            </Stack>

            <Stack
                direction="column"
                padding={2}
            >
                <Typography fontWeight={500} fontSize={20} marginBottom={1}>You might also like this:</Typography>
                <Divider />

                {
                    !isLoading ?
                        <Box
                            flex={3}
                        >
                            <Grid
                                container
                                spacing={2}
                            >
                                {
                                    recommendedPosts.map((post, index) => (
                                        <Grid
                                            item
                                            xs={12} sm={4}
                                            key={index}
                                        >
                                            <PostCard
                                                post={post}
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
                }
            </Stack>
        </Paper>
    );
};

export default PostDetails; 