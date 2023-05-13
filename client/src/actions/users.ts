import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

interface User {
    userID: number, 
    userName: string,
    profilePicture: string
};

interface Users {
    isAuthenticated: boolean,
    user: User 
};

const initialState: Users = {
    isAuthenticated: false, 
    user: {
        userID: -1,
        userName: "",
        profilePicture: "" 
    }
},
    getAuthStatus = createAsyncThunk('users/getAuthStatus', async () => {
        const response = await fetch('http://localhost:5000/users/authStatus', {
            method: 'GET',
            headers: {
                "Accept": "application/json"
            },
            credentials: 'include'
        });

        return response.json();
    });

const userSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        login: (state: Users, action: PayloadAction<User>) => {
            state.isAuthenticated = true; 
            state.user = {
                ...state.user,
                userID: action.payload.userID,
                userName: action.payload.userName,
                profilePicture: action.payload.profilePicture
            };
        },
        logout: (state: Users) => {
            state.isAuthenticated = false;
            state.user.userID = -1;
            state.user.userName = "";
            state.user.profilePicture = ""; 
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getAuthStatus.pending, (state: Users) => {
            state = initialState;
        });

        builder.addCase(getAuthStatus.fulfilled, (state: Users, action) => {
            if (action.payload.success) {
                state.isAuthenticated = true; 
                state.user.userID = action.payload.user.userID;
                state.user.userName = action.payload.user.userName;
                state.user.profilePicture = action.payload.user.profilePicture; 
            } else {
                state = initialState;
            }
        });

        builder.addCase(getAuthStatus.rejected, (state: Users) => {
            state = initialState;
        });
    }
}),
    { login, logout } = userSlice.actions;

export default userSlice.reducer; 
export { login, getAuthStatus, logout }; 