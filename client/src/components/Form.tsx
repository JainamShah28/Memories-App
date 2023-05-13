import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, AppDispatch } from '../index';

// import { getToken } from '../actions/csrf';
import { create, Post, update } from '../actions/posts';

import { Box, TextField, Stack, styled, ButtonGroup, Button, Typography } from '@mui/material';

const StyledBox = styled(Box)(({ theme }) => ({
    backgroundColor: "white",
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    height: "fit-content"
}));

interface FormData {
    title: string,
    message: string,
    hashTags: string
}

interface IsValidData {
    title: boolean,
    message: boolean
}

interface Errors {
    title: string,
    message: string
}

interface FormProps {
    currentPost: number | null,
    setCurrentPost: React.Dispatch<React.SetStateAction<number | null>>
}

const Form: React.FC<FormProps> = ({ currentPost, setCurrentPost }) => {
    const [formData, setFormData] = React.useState<FormData>({
        title: "",
        message: "",
        hashTags: ""
    }),
        [isValidFormData, setIsValidFormData] = React.useState<IsValidData>({
            title: false,
            message: false
        }),
        [errors, setErrors] = React.useState<Errors>({
            title: "",
            message: ""
        }),
        [file, setFile] = React.useState<File | string>(""),
        fileRef = React.useRef<HTMLInputElement>(null),
        dispatch = useDispatch<AppDispatch>(),
        { posts } = useSelector((state: RootState) => state.posts),
        { userID } = useSelector((state: RootState) => state.users.user);
        // { token } = useSelector((state: RootState) => state.csrf);

    React.useEffect(() => {
        if (!currentPost) {
            clearForm();
        }
    }, [currentPost]); 

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setFormData((formData: FormData) => {
            return {
                ...formData,
                [name]: value
            }
        });
    };

    const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const validateTitle = (title: string | unknown) => {
        let isValidTitle = false;

        if (!title || title === "") {
            setIsValidFormData((isValidFormData: IsValidData) => {
                return {
                    ...isValidFormData,
                    title: true
                }
            });

            setErrors((errors: Errors) => {
                return {
                    ...errors,
                    title: "Please enter post title"
                }
            });
        } else {
            isValidTitle = true;

            setIsValidFormData((isValidFormData: IsValidData) => {
                return {
                    ...isValidFormData,
                    title: false
                }
            });

            setErrors((errors: Errors) => {
                return {
                    ...errors,
                    title: ""
                }
            });
        }

        return isValidTitle;
    };

    const validateMessage = (message: string | unknown) => {
        let isValidMessage = false;

        if (!message || message === "") {
            setIsValidFormData((isValidFormData: IsValidData) => {
                return {
                    ...isValidFormData,
                    message: true
                }
            });

            setErrors((errors: Errors) => {
                return {
                    ...errors,
                    message: "Please enter post message"
                }
            });
        } else {
            isValidMessage = true;

            setIsValidFormData((isValidFormData: IsValidData) => {
                return {
                    ...isValidFormData,
                    message: false
                }
            });

            setErrors((errors: Errors) => {
                return {
                    ...errors,
                    message: ""
                }
            });
        }

        return isValidMessage;
    };

    const clearForm = () => {
        if (fileRef.current) {
            setFile("");
            fileRef.current.value = "";
        }

        setFormData({
            title: "",
            message: "",
            hashTags: ""
        });

        setIsValidFormData({
            title: false,
            message: false
        });

        setErrors({
            title: "",
            message: ""
        });
    };

    const handleSubmit = () => {
        const isValidTitle: boolean = validateTitle(formData.title),
            isValidMessage: boolean = validateMessage(formData.message),
            isValidData: boolean = isValidTitle && isValidMessage;

        const createPost = async () => {
            const data = new FormData();

            data.append("creator", userID.toString());
            data.append("title", formData.title);
            data.append("message", formData.message);
            data.append("postImage", file);
            data.append("tags", formData.hashTags);

            // dispatch(getToken());

            try {
                const response = await fetch('http://localhost:5000/posts/new-post', {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        // "CSRF-Token": token
                    },
                    credentials: "include",
                    body: data
                });

                return response.json();
            } catch (error) {
                console.log(error);
            }
        };

        const updatePost = async (postID: number) => {
            // dispatch(getToken());

            try {
                const response = await fetch(`http://localhost:5000/posts/update/${postID}`, {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        // "CSRF-Token": token
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        title: formData.title,
                        message: formData.message,
                        tags: formData.hashTags
                    })
                });

                return response.json();
            } catch (error) {
                console.log(error);
            }
        };

        if (isValidData) {
            if (currentPost) {
                updatePost(currentPost).then((data) => {
                    const { success, post } = data; 

                    if (success) {
                        dispatch(update({
                            postID: currentPost,
                            title: post.title,
                            message: post.message,
                            tags: post.tags  
                        }));

                        setCurrentPost(null); 
                        clearForm(); 
                    }
                }).catch((error) => {
                    console.log(error); 
                });
            } else {
                createPost().then((data) => {
                    const { success, post } = data;

                    if (success) {
                        dispatch(create({
                            postID: post.postID,
                            creator: post.creator,
                            title: post.title,
                            message: post.message,
                            selectedFile: post.selectedFile,
                            tags: post.tags,
                            createdAt: post.createdAt,
                            likesCount: post.likesCount,
                            likes: []
                        }));

                        clearForm();
                    }
                }).catch((error) => {
                    console.log(error);
                });
            }
        }
    };

    React.useEffect(() => {
        if (currentPost) {
            const post = posts.find((post: Post) => post.postID === currentPost),
                postTags = post?.tags.join(",") || "";

            setFormData({
                title: post?.title || "",
                message: post?.message || "",
                hashTags: postTags
            });
        }
    }, [currentPost, posts]);

    return (
        <StyledBox
            flex={1}
            padding={2}
        >
            <Typography variant='h6'>{currentPost ? "Update an existing Post" : "Create a new Post"}</Typography>

            <Stack direction="column" spacing={2} marginTop={3}>
                <TextField
                    size="small"
                    label="Title"
                    variant="outlined"
                    name="title"
                    helperText={errors.title}
                    defaultValue=""
                    error={isValidFormData.title}
                    onChange={handleChange}
                    value={formData.title}
                    required
                    fullWidth
                />

                <TextField
                    size="small"
                    multiline
                    rows={5}
                    label="Message"
                    variant="outlined"
                    name="message"
                    helperText={errors.message}
                    defaultValue=""
                    error={isValidFormData.message}
                    onChange={handleChange}
                    value={formData.message}
                    required
                    fullWidth
                />

                <input
                    type="file"
                    name="postImage"
                    accept="image/jpg, image/jpeg, image/png"
                    onChange={handleSelect}
                    ref={fileRef}
                ></input>

                <TextField
                    multiline
                    rows={2}
                    size="small"
                    label="Hashtags (Comma separated)"
                    variant="outlined"
                    name="hashTags"
                    onChange={handleChange}
                    value={formData.hashTags}
                    fullWidth
                />

                <ButtonGroup fullWidth>
                    <Button variant="contained" color='secondary' onClick={handleSubmit}>{currentPost ? "update" : "create"}</Button>
                    <Button variant="outlined" color='secondary' onClick={clearForm}>clear</Button>
                </ButtonGroup>
            </Stack>
        </StyledBox>
    );
};

export default Form; 