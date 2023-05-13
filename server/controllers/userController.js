import bcrypt from 'bcrypt';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

import { connection } from "../index.js";

const registerUser = (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

    if (firstName === "" && lastName === "" && password.length <= 4 && !/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(email)) {
        return res.status(400).json({
            "success": false,
            "message": "Invalid Data"
        });
    } else {
        connection.query(`SELECT * FROM Users WHERE email = "${email}"`, (error, rows) => {
            if (!error) {
                if (Array.from(rows).length === 0) {
                    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

                    connection.query(`INSERT INTO Users(userName, email, pass_word)
                        VALUES("${firstName} ${lastName}", "${email}", "${hashedPassword}")`, (error, result) => {
                        if (!error) {
                            const token = jwt.sign({ userID: result.insertId }, process.env.JWT_SECRET, {
                                expiresIn: process.env.JWT_EXPIRE_TIME
                            });

                            res.cookie(process.env.COOKIE_NAME, token, {
                                httpOnly: true,
                                maxAge: process.env.JWT_EXPIRE_TIME
                            });

                            connection.query(`SELECT * FROM Users WHERE userID = ${result.insertId}`, (error, rows) => {
                                const user = Array.from(rows)[0];

                                if (!error) {
                                    return res.status(200).json({
                                        "success": true,
                                        "message": "Registered Successfully!",
                                        "user": {
                                            "userID": result.insertId,
                                            "userName": user.userName,
                                            "profilePicture": user.profilePicture
                                        }
                                    });
                                } else {
                                    return res.status(500).json({
                                        "success": false,
                                        "message": error
                                    });
                                }
                            })
                        } else {
                            return res.status(502).json({
                                "success": false,
                                "message": error
                            });
                        }
                    });
                } else {
                    return res.status(409).json({
                        "success": false,
                        "message": "Email address has been already registered"
                    });
                }
            } else {
                return res.status(502).json({
                    "success": false,
                    "message": error
                });
            }
        });
    }
};

const loginUser = (req, res, next) => {
    passport.authenticate("local", { session: false }, (error, user, msg) => {
        if (error || !user) {
            return res.status(401).json({
                "success": false,
                "message": msg
            });
        } else {
            req.login(user, { session: false }, (error) => {
                if (error) {
                    return res.status(500).json({
                        "success": false,
                        "message": error
                    });
                } else {
                    const token = jwt.sign({ userID: user.userID }, process.env.JWT_SECRET, {
                        expiresIn: process.env.JWT_EXPIRE_TIME
                    });

                    res.cookie(process.env.COOKIE_NAME, token, {
                        httpOnly: true,
                        maxAge: process.env.JWT_EXPIRE_TIME
                    });

                    return res.status(200).json({
                        "success": true,
                        "message": "Logged in Successfully!",
                        "user": {
                            "userID": user.userID,
                            "userName": user.userName,
                            "profilePicture": user.profilePicture
                        }
                    });
                }
            });
        }
    })(req, res, next);
};

const checkAuthStatus = (req, res, next) => {
    const token = req.cookies.authToken;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
            if (error) {
                return res.status(401).json({
                    "success": false,
                    "message": "Unauthorized"
                });
            } else {
                connection.query(`SELECT * FROM Users WHERE userID = ${user.userID}`, (error, result) => {
                    if (!error) {
                        let authorizedUser = Array.from(result)[0];

                        return res.status(200).json({
                            "success": true,
                            "message": "Authorized User",
                            "user": {
                                "userID": user.userID,
                                "userName": authorizedUser.userName,
                                "profilePicture": authorizedUser.profilePicture
                            }
                        });
                    }
                });
            }
        });
    } else {
        return res.status(401).json({
            "success": false,
            "message": "Unauthorized"
        });
    }
};

const logOut = (req, res, next) => {
    res.clearCookie(process.env.COOKIE_NAME);

    res.status(200).json({
        "success": true,
        "message": "Logout successfully!"
    });
};

export { registerUser, loginUser, checkAuthStatus, logOut }; 