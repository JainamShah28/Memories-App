import React from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { AppDispatch, RootState } from '../index';

import { Card, CardMedia, CardContent, Typography, Box, CardActions, Button, Stack, IconButton, Checkbox, ButtonBase } from '@mui/material';
import { Delete, MoreVert, ThumbUp, ThumbUpOutlined } from '@mui/icons-material';

import { deletePost, like, disLike, Post } from '../actions/posts';
// import { getToken } from '../actions/csrf';

import DefaultImage from '../assets/default_image.png';

interface PostProps {
    post: Post,
    setCurrentPost?: React.Dispatch<React.SetStateAction<number | null>>
};

const PostCard: React.FC<PostProps> = ({ post, setCurrentPost }) => {
    const dispatch = useDispatch<AppDispatch>(),
        { isAuthenticated, user } = useSelector((state: RootState) => state.users),
        [liked, setLiked] = React.useState<boolean>(post.likes.find((like) => like.userID === user.userID) ? true : false),
        navigate = useNavigate();
    // { token } = useSelector((state: RootState) => state.csrf);


    const del = async (postID: number) => {
        // dispatch(getToken());

        try {
            const response = await fetch(`http://localhost:5000/posts/delete/${postID}`, {
                method: 'DELETE',
                headers: {
                    "Accept": "application/json",
                    // "CSRF-Token": token
                },
                credentials: "include"
            });

            return response.json();
        } catch (error) {
            console.log(error);
        }
    };

    const delPost = (postID: number) => (event: React.MouseEvent<HTMLButtonElement>) => {
        del(postID).then((data) => {
            if (data.success) {
                dispatch(deletePost(postID));
            }
        }).catch((error) => {
            console.log(error);
        });
    };

    const likePost = async (postID: number) => {
        try {
            const response = await fetch(`http://localhost:5000/posts/like/${postID}`, {
                method: 'PATCH',
                credentials: 'include'
            });

            return response.json();
        } catch (error) {
            console.log(error);
        }
    };

    const disLikePost = async (postID: number) => {
        try {
            const response = await fetch(`http://localhost:5000/posts/disLike/${postID}`, {
                method: 'PATCH',
                credentials: 'include'
            });

            return response.json();
        } catch (error) {
            console.log(error);
        }
    };

    const handleLike = (postID: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("*");

        if (liked) {
            disLikePost(postID).then((data) => {
                if (data.success) {
                    dispatch(disLike({
                        postID: postID,
                        userID: user.userID
                    }));
                }
            }).catch((error) => {
                console.log(error);
            });
        } else {
            likePost(postID).then((data) => {
                if (data.success) {
                    dispatch(like({
                        postID: postID,
                        userID: user.userID
                    }));
                }
            }).catch((error) => {
                console.log(error);
            });
        }

        setLiked(liked => !liked);
    };

    const handleClick = (postID: number) => {
        navigate(`/posts/${postID}`);
    };

    return (
        <Card
            sx={{
                width: "100%",
                position: "relative"
            }}
        >
            <ButtonBase
                onClick={() => handleClick(post.postID)}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    textAlign: "left"
                }}
            >
                <CardMedia
                    component="img"
                    height="200"
                    image={post.selectedFile !== "" ? post.selectedFile : DefaultImage}
                />

                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        padding: "8px 12px",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <Stack
                        direction="column"
                    >
                        <Typography color="white" fontWeight={500} fontSize={18}>{post.creator.userName}</Typography>
                        <Typography color="white" fontWeight={300} fontSize={12}>{moment(post.createdAt).fromNow()}</Typography>
                    </Stack>

                    {
                        post.creator.userID === user.userID &&
                        <IconButton onClick={() => setCurrentPost && setCurrentPost(post.postID)}>
                            <MoreVert sx={{ color: "white" }} />
                        </IconButton>
                    }
                </Box>

                <CardContent>
                    {
                        post.tags.length !== 0 &&
                        <Typography variant="body2" fontSize={12} color="GrayText">
                            {
                                post.tags.map((tag) => {
                                    return `#${tag} `
                                })
                            }
                        </Typography>
                    }

                    <Box marginTop={2}>
                        <Typography variant="h6" fontSize={18}>{post.title}</Typography>
                        <Typography variant="body1">{post.message}</Typography>
                    </Box>
                </CardContent>
            </ButtonBase>

            <CardActions
                disableSpacing
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                >
                    <Checkbox
                        icon={<ThumbUpOutlined
                            sx={{
                                color: "#0288D1"
                            }}
                        />}
                        checkedIcon={<ThumbUp
                            sx={{
                                color: "#0288D1"
                            }}
                        />}
                        disabled={!isAuthenticated}
                        checked={isAuthenticated ? liked : false}
                        onChange={handleLike(post.postID)}
                    />

                    <Typography textTransform="uppercase" variant="body2" color="#0288D1" fontWeight={500}>{
                        isAuthenticated ?
                            (liked ? `liked by you ${post.likesCount - 1 > 0 ? `and ${post.likesCount - 1} others` : ""}` : `likes ${post.likesCount}`) :
                            `likes ${post.likesCount}`
                    }</Typography>

                </Stack>

                {
                    post.creator.userID === user.userID &&
                    <Button color="info" startIcon={<Delete />} onClick={delPost(post.postID)}>delete</Button>
                }
            </CardActions>
        </Card>
    );
};

export default PostCard; 