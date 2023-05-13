import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const isAuthenticated = (req, res, next) => {
    const token = req.cookies.authToken;

    if (token) {
        const isValidToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!isValidToken) {
            return res.status(401).json({
                "success": false,
                "message": "Unauthorized"
            });
        } else {
            return next(); 
        }
    } else {
        return res.status(401).json({
            "success": false, 
            "message": "Unauthorized"
        });
    }
};

export { isAuthenticated }; 