import express from 'express';
import multer from 'multer';

import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { getPosts, createNewPost, updatePost, deletePost, likePost, disLikePost, getPostsBySearch, getPostByID } from '../controllers/postController.js';

const router = express.Router(),
    storage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, 'uploads/');
        },
        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9),
                filename = file.originalname.split(".");
            callback(null, filename[0] + '-' + uniqueSuffix + '.' + filename[1]);
        }
    }),
    upload = multer({
        storage: storage,
        limits: {
            fileSize: 5000000
        },
        fileFilter: (req, file, callback) => {
            if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' || file.mimetype == 'image/png') {
                callback(null, true);
            } else {
                callback(new Error('Only jpg, jpeg and png files are allowed!'), false);
            }
        }
    });

router.get('/', getPosts);
router.get('/search', getPostsBySearch); 
router.get('/:postID', getPostByID); 

router.post('/new-post', isAuthenticated, upload.single("postImage"), createNewPost);

router.patch('/update/:postID', isAuthenticated, updatePost); 

router.delete('/delete/:postID', isAuthenticated, deletePost); 

router.patch('/like/:postID', isAuthenticated, likePost); 
router.patch('/disLike/:postID', isAuthenticated, disLikePost); 

export default router; 