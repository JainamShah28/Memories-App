import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { AppDispatch, RootState } from '../index';

import { getPostsBySerach, getPosts } from '../actions/posts';

import { Stack, Box, Typography, Paper, Button, TextField } from '@mui/material';
import { MuiChipsInput } from 'mui-chips-input';

import PostsContainer from '../components/PostsContainer';
import Form from '../components/Form';
import CustomPagination from '../components/CustomPagination';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const Home: React.FC = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.users),
        dispatch = useDispatch<AppDispatch>(),
        [currentPost, setCurrentPost] = React.useState<number | null>(null),
        query = useQuery(),
        navigate = useNavigate(),
        page = query.get('page') || 1,
        [tags, setTags] = React.useState<string[]>([]),
        [search, setSearch] = React.useState<string>("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleAdd = (tag: string) => {
        setTags((prevTags) => [...prevTags, tag]);
    };

    const handleDelete = (tag: string) => {
        setTags((prevTags) => prevTags.filter((prevTag) => prevTag !== tag));
    };

    const handleSerach = () => {
        if (search.trim() !== "" || tags.length !== 0) {
            dispatch(getPostsBySerach({
                search: search,
                tags: tags.join(",")
            }));
        } else {
            navigate('/');
        }
    };

    React.useEffect(() => {
        if (page) {
            dispatch(getPosts(Number(page)));
        }
    }, [dispatch, page]);

    return (
        <Stack
            direction={{ sm: "column", md: "row-reverse" }}
            spacing={2}
            marginTop={2}
        >
            <Box
                flex={1}
                flexDirection="column"
                justifyContent="flex-start"
            >
                <Paper
                    sx={(theme) => ({
                        padding: 2,
                        boxShadow: theme.shadows[3],
                        marginBottom: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5
                    })}
                >
                    <TextField
                        sx={{
                            width: "100%"
                        }}
                        size='small'
                        name='search'
                        label='Serach'
                        type='text'
                        error={false}
                        helperText=''
                        value={search}
                        onChange={handleChange}
                    />

                    <MuiChipsInput
                        style={{
                            margin: '10px 0',
                            width: '100%'
                        }}
                        value={tags}
                        onAddChip={handleAdd}
                        onDeleteChip={handleDelete}
                        label="Search Tags"
                        variant="outlined"
                        size="small"
                    />

                    <Button
                        variant="contained"
                        sx={{
                            width: "30%"
                        }}
                        onClick={handleSerach}
                    >
                        search
                    </Button>
                </Paper>

                {
                    isAuthenticated ?
                        <Form
                            currentPost={currentPost}
                            setCurrentPost={setCurrentPost}
                        /> :
                        <Box>
                            <Typography>Please Sign In or Register yourself to create your own memories and like other's memories.</Typography>
                        </Box>
                }

                <Paper
                    sx={(theme) => ({
                        boxShadow: theme.shadows[3],
                        display: "flex",
                        justifyContent: "center",
                        padding: 1,
                        marginTop: 2
                    })}
                >
                    <CustomPagination
                        page={Number(page)}
                    />
                </Paper>
            </Box>

            <PostsContainer
                setCurrentPost={setCurrentPost}
            />
        </Stack>
    )
};

export default Home; 