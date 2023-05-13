import passport from 'passport';
import passportLocal from 'passport-local';
import passportGoogle from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import { connection } from './index.js';

dotenv.config(); 

const LocalStrategy = passportLocal.Strategy,
    GoogleStrategy = passportGoogle.Strategy;

passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false
}, (userName, password, callback) => {
    connection.query(`SELECT * FROM Users WHERE email = "${userName}"`, (error, rows) => {
        if (!error) {
            const user = Array.from(rows);

            if (user.length === 0) {
                return callback(null, false, { message: "Incorrect email or password" });
            } else {
                const comaparePassword = bcrypt.compareSync(password, user[0].pass_word);

                if (!comaparePassword) {
                    return callback(null, false, { message: "Incorrect email or password" });
                } else {
                    return callback(null, user[0]);
                }
            }
        }
    });
})); 

passport.use('google', new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
    return done(none, profile);     
}));