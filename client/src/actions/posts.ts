import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Creator {
    userID: number,
    userName: string
};

interface Like {
    userID: number
};

interface Post {
    postID: number,
    creator: Creator,
    title: string,
    message: string,
    selectedFile: string,
    likesCount: number,
    createdAt: string,
    tags: string[],
    likes: Like[]
};

interface Posts {
    posts: Post[],
    isLoading: boolean,
    currentPage: number,
    noOfPages: number,
    post: Post
};

interface UpdatePayload {
    postID: number,
    title: string,
    message: string,
    tags: string[]
};

interface PostLike {
    postID: number,
    userID: number
};

interface SearchQuery {
    search?: string,
    tags?: string
};

const initialState: Posts = {
    posts: [],
    isLoading: true,
    currentPage: 1,
    noOfPages: 1,
    post: {
        postID: -1,
        creator: {
            userID: -1,
            userName: ""
        },
        title: "",
        message: "",
        selectedFile: "",
        likesCount: 0,
        createdAt: "",
        tags: [],
        likes: []
    }
},
    getPosts = createAsyncThunk('posts/getPosts', async (page: number | string) => {
        const response = await fetch(`http://localhost:5000/posts?page=${page}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        return response.json();
    }),
    getPostsBySerach = createAsyncThunk('posts/getPostsBySearch', async (searchQuery: SearchQuery) => {
        const response = await fetch(`http://localhost:5000/posts/search?searchQuery=${searchQuery.search ? searchQuery.search : ""}&tags=${searchQuery.tags}`, {
            method: 'GET',
            headers: {
                "Accept": "application/json"
            }
        });

        return response.json();
    }),
    getPostByID = createAsyncThunk('posts/getPostByID', async (postID: number) => {
        const response = await fetch(`http://localhost:5000/posts/${postID}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        return response.json();
    });

const postsSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        create: (state: Posts, action: PayloadAction<Post>) => {
            state.posts = [action.payload, ...state.posts];
        },
        update: (state: Posts, action: PayloadAction<UpdatePayload>) => {
            state.posts = state.posts.map((post) => {
                if (post.postID === action.payload.postID) {
                    return {
                        ...post,
                        title: action.payload.title,
                        message: action.payload.message,
                        tags: action.payload.tags
                    }
                } else {
                    return post;
                }
            });
        },
        deletePost: (state: Posts, action: PayloadAction<number>) => {
            state.posts = state.posts.filter(post => post.postID !== action.payload);
        },
        like: (state: Posts, action: PayloadAction<PostLike>) => {
            state.posts = state.posts.map((post) => {
                if (post.postID === action.payload.postID) {
                    return {
                        ...post,
                        likesCount: post.likesCount + 1,
                        likes: [...post.likes, { userID: action.payload.userID }]
                    };
                } else {
                    return post;
                }
            });
        },
        disLike: (state: Posts, action: PayloadAction<PostLike>) => {
            state.posts = state.posts.map((post) => {
                if (post.postID === action.payload.postID) {
                    return {
                        ...post,
                        likesCount: post.likesCount - 1,
                        likes: post.likes.filter((like) => like.userID === action.payload.userID)
                    };
                } else {
                    return post;
                }
            });
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getPosts.pending, (state: Posts) => {
            state.isLoading = true;
        });

        builder.addCase(getPosts.fulfilled, (state: Posts, action) => {
            state.isLoading = false;
            state.posts = action.payload.posts;
            state.currentPage = action.payload.currentPage;
            state.noOfPages = action.payload.noOfPages;
        });

        builder.addCase(getPosts.rejected, (state: Posts) => {
            console.log("Something went wrong!");
        });

        builder.addCase(getPostsBySerach.pending, (state: Posts) => {
            state.isLoading = true;
        });

        builder.addCase(getPostsBySerach.fulfilled, (state: Posts, action) => {
            state.isLoading = false;
            state.posts = action.payload.posts;
        });

        builder.addCase(getPostsBySerach.rejected, (state: Posts) => {
            console.log("Something went wrong!");
        });

        builder.addCase(getPostByID.pending, (state: Posts) => {
            state.isLoading = true;
        });

        builder.addCase(getPostByID.fulfilled, (state: Posts, action) => {
            state.isLoading = false;
            state.post = action.payload.post; 
        });

        builder.addCase(getPostByID.rejected, (state: Posts) => {
            console.log("Something went wrong!");
        });
    }
}),
    { create, deletePost, like, disLike, update } = postsSlice.actions;

export { getPosts, create, deletePost, like, update, disLike, getPostsBySerach, getPostByID };
export default postsSlice.reducer;
export type { Post }; 