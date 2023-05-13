import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

import postsReducer from './actions/posts';
import csrfReducer from './actions/csrf';
import usersReducer from './actions/users';

const store = configureStore({
    reducer: {
        posts: postsReducer,
        csrf: csrfReducer,
        users: usersReducer
    }
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <App />
            </Provider>
        </BrowserRouter>
    </React.StrictMode>
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 