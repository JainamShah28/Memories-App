import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface Csrf {
    token: string 
};

const initialState: Csrf = {
    token: ""
};

const getToken = createAsyncThunk('csrf/getToken', async () => {
    const response = await fetch('http://localhost:5000/csrf/get-token', {
        method: 'GET',
        headers: {
            "Accept": "application/json"
        },
        credentials: "same-origin"
    }); 

    return response.json(); 
});

const csrfSlice = createSlice({
    name: 'csrf',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(getToken.fulfilled, (state: Csrf, action) => {
            state.token = action.payload.csrfToken;
        });
    }
});

export default csrfSlice.reducer; 
export { getToken }; 