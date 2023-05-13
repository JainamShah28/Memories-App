import exporess from 'express';
import passport from 'passport';
import dotenv from 'dotenv';

dotenv.config(); 

import { registerUser, loginUser, checkAuthStatus, logOut } from '../controllers/userController.js';

const router = exporess.Router();

router.post('/register', registerUser); 
router.post('/login', loginUser);

router.get('/authStatus', checkAuthStatus); 

router.get('/logOut', logOut); 

router.get('/auth', passport.authenticate(passport.Strategy('google'), {
    scope: ['profile', 'email'],
    session: false 
})); 

router.get('/auth/callback', passport.authenticate(passport.Strategy('google'), {
    successRedirect: 'http://localhost:5000/users/auth/callback/success',
    failureRedirect: 'http://localhost:5000/users/auth/callback/failure',
    session: false
}));

router.get('/auth/callback/success', (req, res) => {
    if (!req.user) 
        res.redirect('http://localhost:5000/users/auth/callback/failure');
    else {
        res.status(200).json({
            "success": true, 
            "user": req.user
        });
    }
});

router.get('/auth/callback/failure', (req, res) => {
    res.status(401).json({
        "success": false,
        "message": "Unauthorized Access"
    });
});

export default router; 