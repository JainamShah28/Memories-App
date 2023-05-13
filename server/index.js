import express from 'express';
import cors from 'cors'; 
import dotenv from 'dotenv';
import morgan from 'morgan';
import mysql from 'mysql'; 
import path from 'path'; 
import cookieParser from 'cookie-parser';
// import helmet from 'helmet';
// import csrf from 'csurf';
import passport from 'passport';

import './passport.js'; 

import postsRoute from './routes/posts.js'; 
import usersRoute from './routes/users.js'; 

dotenv.config(); 

const app = express(),
    host = process.env.HOST,
    port = process.env.PORT,
    connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB  
    });

app.use(express.json());
app.use(express.urlencoded({
    extended: true
})); 

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true 
}));

app.use(cookieParser());

app.use(morgan("dev"));

app.use('/uploads/', express.static(path.join(process.cwd(), 'uploads/')));

// app.use(helmet());

// app.use(csrf({
//     cookie: {
//         httpOnly: true
//     }
// })); 

// app.get('/csrf/get-token', (req, res, next) => {
//     res.json({
//         "csrfToken": req.csrfToken()
//     });
// });

app.use(passport.initialize()); 

app.use('/posts', postsRoute);
app.use('/users', usersRoute); 

app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
}); 

app.listen(port, host, (error) => {
    if (error) {
        console.log("Failed to start the server!");
    } else {
        connection.connect((error) => {
            if (error) {
                console.log(error); 
            } else {
                console.log(`Server is running at http://${host}:${port}`);
            }
        });
    }
});

export { connection }; 