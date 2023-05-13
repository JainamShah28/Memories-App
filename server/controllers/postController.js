import fs from 'fs';
import path from 'path';
import jwtDecode from 'jwt-decode';

import { connection } from "../index.js";

const getPosts = (req, res, next) => {
    const { page } = req.query,
        postPerPage = 6,
        startIndex = (Number(page) - 1) * postPerPage;

    connection.query(`SELECT COUNT(postID) AS numberOfPosts FROM Posts`, (error, rows) => {
        if (!error) {
            const totalPosts = rows[0].numberOfPosts;

            connection.query(`SELECT * FROM Posts 
                ORDER BY createdAt DESC
                LIMIT ${startIndex}, ${postPerPage}`, (error, rows) => {
                if (error) {
                    return res.status(502).json({
                        "success": false,
                        "message": error
                    });
                } else {
                    let posts = Array.from(rows);

                    connection.query(`SELECT post, tag FROM PostTags`, (error, rows) => {
                        if (!error) {
                            posts = posts.map((post) => {
                                const postTags = Array.from(rows).filter((postTag) => postTag.post === post.postID),
                                    tags = [];

                                postTags.forEach((postTag) => {
                                    tags.push(postTag.tag);
                                });

                                return ({
                                    ...post,
                                    "tags": tags
                                });
                            });

                            connection.query(`SELECT Users.userID, Users.userName, Posts.postID FROM Users
                                INNER JOIN Posts ON Posts.creator = Users.userID`, (error, rows) => {
                                if (!error) {
                                    posts = posts.map((post) => {
                                        const creator = Array.from(rows).filter(((creator) => creator.postID === post.postID));

                                        return ({
                                            ...post,
                                            "creator": {
                                                "userID": creator[0].userID,
                                                "userName": creator[0].userName
                                            }
                                        });
                                    });

                                    connection.query(`SELECT * FROM PostLikes`, (error, rows) => {
                                        if (!error) {
                                            posts = posts.map((post) => {
                                                const likesData = Array.from(rows).filter((like) => like.postID === post.postID),
                                                    likes = [];

                                                likesData.forEach((like) => {
                                                    likes.push({ userID: like.userID });
                                                });

                                                return ({
                                                    ...post,
                                                    "likes": likes,
                                                    "likesCount": likes.length
                                                });
                                            });

                                            return res.status(200).json({
                                                "success": true,
                                                "currentPage": Number(page),
                                                "noOfPages": Math.ceil(totalPosts / postPerPage),
                                                "count": posts.length,
                                                "posts": posts
                                            });
                                        } else {
                                            return res.status(502).json({
                                                "success": false,
                                                "message": error
                                            });
                                        }
                                    });
                                } else {
                                    return res.status(502).json({
                                        "success": false,
                                        "message": error
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            return res.status(502).json({
                "success": false,
                "message": error
            });
        }
    });
};

const getPostByID = (req, res, next) => {
    const { postID } = req.params;

    connection.query(`SELECT * FROM Posts WHERE postID = ${postID}`, (error, rows) => {
        if (!error) {
            if (Array.from(rows).length !== 0) {
                let post = Array.from(rows)[0];

                connection.query(`SELECT tag FROM PostTags WHERE post = ${postID}`, (error, rows) => {
                    if (!error) {
                        let postTags = Array.from(rows).map((row) => row.tag);

                        connection.query(`SELECT Users.userID, Users.userName FROM Users
                            INNER JOIN Posts
                            ON Posts.creator = Users.userID
                            WHERE Posts.postID = ${postID}`, (error, rows) => {
                                if (!error) {
                                    let creator = Array.from(rows)[0];

                                    connection.query(`SELECT userID FROM PostLikes WHERE postID = ${postID}`, (error, rows) => {
                                        if (!error) {
                                            let postLikes = Array.from(rows).map((row) => row.userID);

                                            return res.status(200).json({
                                                "success": true, 
                                                "post": {
                                                    ...post,
                                                    "tags": postTags,
                                                    "likes": postLikes,
                                                    "likesCount": postLikes.length,
                                                    "creator": creator
                                                }
                                            });
                                        } else {
                                            return res.status(502).json({
                                                "success": false,
                                                "message": error
                                            });
                                        }
                                    });
                                } else {
                                    return res.status(502).json({
                                        "success": false,
                                        "message": error
                                    });
                                }
                        });
                    } else {
                        return res.status(502).json({
                            "success": false,
                            "message": error
                        });
                    }
                })
            } else {
                return res.status(404).json({
                    "success": false,
                    "message": "Post doesn't exists!"
                });
            }
        } else {
            return res.status(502).json({
                "success": false,
                "message": error
            });
        }
    });
};

const createNewPost = (req, res, next) => {
    const { creator, title, message, tags } = req.body;
    let postImage;

    if (title && title !== "" && message && message !== "") {
        postImage = req.file && `${req.protocol}://${req.headers.host}/uploads/${req.file.filename}`;

        connection.query(`INSERT INTO Posts(creator, title, message, selectedFile)
            VALUES(${creator}, "${title}", "${message}", "${postImage ? postImage : ""}")`, (error, result) => {
            if (error) {
                const filePath = path.join(process.cwd(), '/uploads', req.file.filename);

                req.file && fs.unlink(`${filePath}`, (err) => {
                    if (err) {
                        return res.status(502).json({
                            "success": false,
                            "message": "Server error!"
                        });
                    } else {
                        return res.status(502).json({
                            "success": false,
                            "message": error
                        });
                    }
                });
            } else {
                if (tags && tags !== "") {
                    tags.split(",").forEach((tag) => {
                        connection.query(`INSERT INTO PostTags(post, tag)
                            VALUES("${result.insertId}", "${tag.toString().trim()}")`);
                    });
                }

                connection.query(`SELECT * FROM Posts WHERE postID = ${result.insertId}`, (error, rows) => {
                    if (!error) {
                        let post = Array.from(rows)[0];

                        connection.query(`SELECT Users.userID, Users.userName FROM Posts
                    INNER JOIN Users ON Posts.creator = Users.userID
                    WHERE Posts.postID = ${post.postID}`, (error, rows) => {
                            if (!error) {
                                return res.status(200).json({
                                    "success": true,
                                    "post": {
                                        ...post,
                                        "tags": tags ? tags.split(",") : [],
                                        "likes": [],
                                        "creator": Array.from(rows)[0]
                                    }
                                });
                            } else {
                                return res.status(502).json({
                                    "success": false,
                                    "message": error
                                });
                            }
                        });
                    } else {
                        return res.status(502).json({
                            "success": false,
                            "message": error
                        });
                    }
                });
            }
        });
    } else {
        return res.status(400).json({
            "success": false,
            "message": "Invalid data"
        });
    }
};

const updatePost = (req, res, next) => {
    const { postID } = req.params,
        { title, message, tags } = req.body;

    connection.query(`SELECT * FROM Posts WHERE postID = ${postID}`, (error, rows) => {
        if (!error) {
            if (Array.from(rows).length !== 0) {
                const post = Array.from(rows)[0];

                if (post.title !== title || post.message !== message) {
                    connection.query(`UPDATE Posts SET title = "${title}", message = "${message}"
                        WHERE postID = ${postID}`, (error) => {
                        if (!error) {
                            connection.query(`SELECT * FROM PostTags WHERE post = ${postID}`, (error, rows) => {
                                if (!error) {
                                    let postTagsArr = [], postTags;

                                    Array.from(rows).forEach((postTag) => {
                                        postTagsArr.push(postTag.tag);
                                    });

                                    postTags = postTagsArr.join(",");

                                    if (tags && postTags !== tags) {
                                        connection.query(`DELETE FROM PostTags WHERE post = ${postID}`, (error) => {
                                            if (!error) {
                                                tags.split(",").forEach((postTag) => {
                                                    connection.query(`INSERT INTO PostTags(post, tag)
                                                        VALUES(${postID}, "${postTag}")`);
                                                });

                                                connection.query(`SELECT Users.userID, Users.userName FROM Users
                                                    INNER JOIN Posts ON Posts.creator = Users.userID
                                                    WHERE Posts.postID = ${postID}`, (error, rows) => {
                                                    if (!error) {
                                                        const creator = Array.from(rows)[0];

                                                        connection.query(`SELECT userID FROM PostLikes WHERE postID = ${postID}`, (error, rows) => {
                                                            if (!error) {
                                                                return res.status(200).json({
                                                                    "success": true,
                                                                    "post": {
                                                                        ...post,
                                                                        "title": title,
                                                                        "message": message,
                                                                        "tags": tags.split(","),
                                                                        "creator": creator,
                                                                        "likes": Array.from(rows)
                                                                    }
                                                                });
                                                            } else {
                                                                return res.status(502).json({
                                                                    "success": false,
                                                                    "message": error
                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        return res.status(502).json({
                                                            "success": false,
                                                            "message": error
                                                        });
                                                    }
                                                });
                                            } else {
                                                return res.status(502).json({
                                                    "success": false,
                                                    "message": error
                                                });
                                            }
                                        });
                                    } else {
                                        connection.query(`SELECT Users.userID, Users.userName FROM Users
                                        INNER JOIN Posts ON Posts.creator = Users.userID
                                        WHERE Posts.postID = ${postID}`, (error, rows) => {
                                            const creator = Array.from(rows)[0];

                                            if (!error) {
                                                connection.query(`SELECT userID FROM PostLikes WHERE postID = ${postID}`, (error, rows) => {
                                                    if (!error) {
                                                        return res.status(200).json({
                                                            "success": true,
                                                            "post": {
                                                                ...post,
                                                                "title": title,
                                                                "message": message,
                                                                "tags": postTagsArr,
                                                                "creator": creator,
                                                                "likes": Array.from(rows)
                                                            }
                                                        });
                                                    } else {
                                                        return res.status(502).json({
                                                            "success": false,
                                                            "message": error
                                                        });
                                                    }
                                                });
                                            } else {
                                                return res.status(502).json({
                                                    "success": false,
                                                    "message": error
                                                });
                                            }
                                        });
                                    }
                                } else {
                                    return res.status(502).json({
                                        "success": false,
                                        "message": error
                                    });
                                }
                            });
                        } else {
                            return res.status(502).json({
                                "success": false,
                                "message": error
                            });
                        }
                    });
                } else {
                    connection.query(`SELECT * FROM PostTags WHERE post = ${postID}`, (error, rows) => {
                        if (!error) {
                            let postTagsArr = [], postTags;

                            Array.from(rows).forEach((postTag) => {
                                postTagsArr.push(postTag.tag);
                            });

                            postTags = postTagsArr.join(",");

                            if (tags && postTags !== tags) {
                                connection.query(`DELETE FROM PostTags WHERE post = ${postID}`, (error) => {
                                    if (!error) {
                                        tags.split(",").forEach((postTag) => {
                                            connection.query(`INSERT INTO PostTags(post, tag)
                                                VALUES(${postID}, "${postTag}")`);
                                        });

                                        connection.query(`SELECT Users.userID, Users.userName FROM Users
                                            INNER JOIN Posts ON Posts.creator = Users.userID
                                            WHERE Posts.postID = ${postID}`, (error, rows) => {
                                            if (!error) {
                                                const creator = Array.from(rows)[0];

                                                connection.query(`SELECT userID FROM PostLikes WHERE postID = ${postID}`, (error, rows) => {
                                                    if (!error) {
                                                        return res.status(200).json({
                                                            "success": true,
                                                            "post": {
                                                                ...post,
                                                                "tags": tags.split(","),
                                                                "creator": creator,
                                                                "likes": Array.from(rows)
                                                            }
                                                        });
                                                    } else {
                                                        return res.status(502).json({
                                                            "success": false,
                                                            "message": error
                                                        });
                                                    }
                                                });
                                            } else {
                                                return res.status(502).json({
                                                    "success": false,
                                                    "message": error
                                                });
                                            }
                                        });
                                    } else {
                                        return res.status(502).json({
                                            "success": false,
                                            "message": error
                                        });
                                    }
                                });
                            } else {
                                connection.query(`SELECT Users.userID, User.userName FROM Users
                                    INNER JOIN Posts ON Posts.creator = Users.userID
                                    WHERE Posts.postID = ${postID}`, (error, rows) => {
                                    if (!error) {
                                        const creator = Array.from(rows)[0];

                                        connection.query(`SELECT userID FROM PostLikes WHERE postID = ${postID}`, (error, rows) => {
                                            if (!error) {
                                                return res.status(200).json({
                                                    "success": true,
                                                    "post": {
                                                        ...post,
                                                        "tags": postTagsArr,
                                                        "creator": creator,
                                                        "likes": Array.from(rows)
                                                    }
                                                });
                                            } else {
                                                return res.status(502).json({
                                                    "success": false,
                                                    "message": error
                                                });
                                            }
                                        });
                                    } else {
                                        return res.status(502).json({
                                            "success": false,
                                            "message": error
                                        });
                                    }
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
            } else {
                return res.status(404).json({
                    "success": false,
                    "message": "Post doesn't exists!"
                });
            }
        } else {
            return res.status(502).json({
                "success": false,
                "message": error
            });
        }
    });
};

const deletePost = (req, res, next) => {
    const { postID } = req.params;

    connection.query(`SELECT * FROM Posts WHERE postID = ${postID}`, (error, rows) => {
        if (!error) {
            if (Array.from(rows).length !== 0) {
                connection.query(`DELETE FROM PostLikes WHERE postID = ${postID}`, (error) => {
                    if (!error) {
                        connection.query(`DELETE FROM PostTags WHERE post = ${postID}`, (error) => {
                            if (!error) {
                                connection.query(`DELETE FROM Posts WHERE postID = ${postID}`, (error) => {
                                    if (!error) {
                                        const file = Array.from(rows)[0].selectedFile;

                                        if (file !== "") {
                                            const fileName = file.split("/"),
                                                filePath = path.join(process.cwd(), '/uploads', fileName[fileName.length - 1]);

                                            fs.unlink(filePath, (err) => {
                                                if (!err) {
                                                    return res.status(200).json({
                                                        "success": true,
                                                        "message": "Post deleted successfully!"
                                                    });
                                                } else {
                                                    return res.status(500).json({
                                                        "success": false,
                                                        "message": err
                                                    });
                                                }
                                            });
                                        }
                                    } else {
                                        return res.status(502).json({
                                            "success": false,
                                            "message": error
                                        });
                                    }
                                });
                            } else {
                                return res.status(502).json({
                                    "success": false,
                                    "message": error
                                });
                            }
                        });
                    } else {
                        return res.status(502).json({
                            "success": false,
                            "message": error
                        });
                    }
                });
            } else {
                return res.status(404).json({
                    "success": false,
                    "message": "Post doesn't exists"
                });
            }
        } else {
            return res.status(502).json({
                "success": false,
                "message": error
            });
        }
    });
};

const likePost = (req, res, next) => {
    const { postID } = req.params,
        { userID } = jwtDecode(req.cookies.authToken);

    connection.query(`SELECT * FROM Posts WHERE postID = ${postID}`, (error, result) => {
        if (!error) {
            if (Array.from(result).length !== 0) {
                const post = Array.from(result)[0];

                connection.query(`SELECT * FROM PostLikes WHERE postID = ${postID} AND userID = ${userID}`, (error, result) => {
                    if (!error) {
                        if (Array.from(result).length === 0) {
                            connection.query(`INSERT INTO PostLikes VALUES(${postID}, ${userID})`, (error, result) => {
                                if (!error) {
                                    connection.query(`UPDATE Posts SET likesCount = ${post.likesCount + 1}`, (error) => {
                                        if (!error) {
                                            return res.status(200).json({
                                                "success": true,
                                                "post": {
                                                    ...post,
                                                    "likesCount": post.likesCount + 1
                                                }
                                            });
                                        } else {
                                            return res.status(502).json({
                                                "success": false,
                                                "message": error
                                            });
                                        }
                                    });
                                } else {
                                    return res.status(502).json({
                                        "success": false,
                                        "message": error
                                    });
                                }
                            });
                        } else {
                            return res.status(405).json({
                                "success": false,
                                "message": "Not Allowed"
                            });
                        }
                    } else {
                        return res.status(502).json({
                            "success": false,
                            "message": error
                        });
                    }
                });
            } else {
                return res.status(404).json({
                    "success": false,
                    "message": "Post doesn't exists"
                });
            }
        } else {
            return res.status(502).json({
                "success": false,
                "message": error
            });
        }
    });
};

const disLikePost = (req, res, next) => {
    const { postID } = req.params,
        { userID } = jwtDecode(req.cookies.authToken);

    connection.query(`SELECT * FROM Posts WHERE postID = ${postID}`, (error, result) => {
        if (!error) {
            if (Array.from(result).length !== 0) {
                const post = Array.from(result)[0];

                if (post.likesCount !== 0) {
                    connection.query(`SELECT * FROM PostLikes WHERE postID = ${postID} AND userID = ${userID}`, (error, result) => {
                        if (!error) {
                            if (Array.from(result).length !== 0) {
                                connection.query(`DELETE FROM PostLikes WHERE postID = ${postID} AND userID = ${userID}`, (error) => {
                                    if (!error) {
                                        connection.query(`UPDATE Posts SET likesCount = ${post.likesCount - 1} WHERE postID = ${postID}`, (error) => {
                                            if (!error) {
                                                return res.status(200).json({
                                                    "success": true,
                                                    "post": {
                                                        ...post,
                                                        "likesCount": post.likesCount - 1
                                                    }
                                                });
                                            } else {
                                                return res.status(502).json({
                                                    "success": false,
                                                    "message": error
                                                });
                                            }
                                        });
                                    } else {
                                        return res.status(502).json({
                                            "success": false,
                                            "message": error
                                        });
                                    }
                                });
                            } else {
                                return res.status(405).json({
                                    "success": false,
                                    "message": "Not Allowed"
                                });
                            }
                        } else {
                            return res.status(502).json({
                                "success": false,
                                "message": error
                            });
                        }
                    });
                } else {
                    return res.status(400).json({
                        "success": false
                    });
                }
            } else {
                return res.status(404).json({
                    "success": false,
                    "message": "Post doesn't exists"
                });
            }
        } else {
            return res.status(502).json({
                "success": false,
                "message": error
            });
        }
    });
};

const getPostsBySearch = (req, res, next) => {
    const { searchQuery, tags } = req.query;

    if (searchQuery !== "") {
        connection.query(`SELECT * FROM Posts
        WHERE title = "${searchQuery}"
        ORDER BY createdAt DESC`, (error, rows) => {
            if (!error) {
                let posts = Array.from(rows);

                connection.query(`SELECT post, tag FROM PostTags`, (error, rows) => {
                    if (!error) {
                        posts = posts.map((post) => {
                            const postTags = Array.from(rows).filter((postTag) => postTag.post === post.postID);
                            let tagsArr = [];

                            postTags.forEach((postTag) => {
                                tagsArr.push(postTag.tag);
                            });

                            return ({
                                ...post,
                                "tags": tagsArr
                            });
                        });

                        if (tags !== "") {
                            posts = posts.filter((post) => {
                                const searchTags = tags.split(",");
                                let flag = true;

                                for (let i = 0; i < searchTags.length; i++) {
                                    if (!post.tags.includes(searchTags[i])) {
                                        flag = false;
                                        break;
                                    }
                                }

                                return flag;
                            });
                        }

                        connection.query(`SELECT Users.userID, Users.userName, Posts.postID FROM Users
                        INNER JOIN Posts ON Posts.creator = Users.userID`, (error, rows) => {
                            if (!error) {
                                posts = posts.map((post) => {
                                    const creator = Array.from(rows).filter((creator) => creator.postID === post.postID)[0];

                                    return ({
                                        ...post,
                                        "creator": {
                                            "userID": creator.userID,
                                            "userName": creator.userName
                                        }
                                    });
                                });

                                connection.query(`SELECT * FROM PostLikes`, (error, rows) => {
                                    if (!error) {
                                        posts = posts.map((post) => {
                                            const likesData = Array.from(rows).filter((like) => like.postID === post.postID),
                                                likes = [];

                                            likesData.forEach((like) => {
                                                likes.push({ userID: like.userID });
                                            });

                                            return ({
                                                ...post,
                                                "likes": likes,
                                                "likesCount": likes.length
                                            });
                                        });

                                        return res.status(200).json({
                                            "success": true,
                                            "count": posts.length,
                                            "posts": posts
                                        });
                                    } else {
                                        return res.status(502).json({
                                            "success": false,
                                            "message": error
                                        });
                                    }
                                });
                            } else {
                                return res.status(502).json({
                                    "success": false,
                                    "message": error
                                });
                            }
                        });
                    } else {
                        return res.status(502).json({
                            "success": false,
                            "message": error
                        });
                    }
                });
            } else {
                return res.status(502).json({
                    "success": false,
                    "message": error
                });
            }
        });
    } else if (tags !== "") {
        connection.query(`SELECT * FROM Posts
            ORDER BY createdAt DESC`, (error, rows) => {
            if (!error) {
                let posts = Array.from(rows);

                connection.query(`SELECT post, tag FROM PostTags`, (error, rows) => {
                    if (!error) {
                        posts = posts.map((post) => {
                            const postTags = Array.from(rows).filter((postTag) => postTag.post === post.postID),
                                tagsArr = [];

                            postTags.forEach((postTag) => {
                                tagsArr.push(postTag.tag);
                            });

                            return ({
                                ...post,
                                "tags": tagsArr
                            });
                        });

                        posts = posts.filter((post) => {
                            const searchTags = tags.split(",");
                            let flag = true;

                            for (let i = 0; i < searchTags.length; i++) {
                                if (!post.tags.includes(searchTags[i])) {
                                    flag = false;
                                    break;
                                }
                            }

                            return flag;
                        });

                        connection.query(`SELECT Users.userID, Users.userName, Posts.postID FROM Users
                            INNER JOIN Posts ON Posts.creator = Users.userID`, (error, rows) => {
                            if (!error) {
                                posts = posts.map((post) => {
                                    const creator = Array.from(rows).filter((creator) => creator.postID === post.postID)[0];

                                    return ({
                                        ...post,
                                        "creator": {
                                            "userID": creator.userID,
                                            "userName": creator.userName
                                        }
                                    });
                                });

                                connection.query(`SELECT * FROM PostLikes`, (error, rows) => {
                                    if (!error) {
                                        posts = posts.map((post) => {
                                            const likesData = Array.from(rows).filter((like) => like.postID === post.postID),
                                                likes = [];

                                            likesData.forEach((like) => {
                                                likes.push({ userID: like.userID });
                                            });

                                            return ({
                                                ...post,
                                                "likes": likes,
                                                "likesCount": likes.length
                                            });
                                        });

                                        return res.status(200).json({
                                            "success": true,
                                            "count": posts.length,
                                            "posts": posts
                                        });
                                    } else {
                                        return res.status(502).json({
                                            "success": false,
                                            "message": error
                                        });
                                    }
                                });
                            } else {
                                return res.status(502).json({
                                    "success": false,
                                    "message": error
                                });
                            }
                        });
                    } else {
                        return res.status(502).json({
                            "success": false,
                            "message": error
                        });
                    }
                });
            } else {
                return res.status(502).json({
                    "success": false,
                    "message": error
                });
            }
        });
    } else {
        connection.query(`SELECT * FROM Posts ORDER BY createdAt DESC`, (error, rows) => {
            if (error) {
                return res.status(502).json({
                    "success": false,
                    "message": error
                });
            } else {
                let posts = Array.from(rows);

                connection.query(`SELECT post, tag FROM PostTags`, (error, rows) => {
                    if (!error) {
                        posts = posts.map((post) => {
                            const postTags = Array.from(rows).filter((postTag) => postTag.post === post.postID),
                                tags = [];

                            postTags.forEach((postTag) => {
                                tags.push(postTag.tag);
                            });

                            return ({
                                ...post,
                                "tags": tags
                            });
                        });

                        connection.query(`SELECT Users.userID, Users.userName, Posts.postID FROM Users
                            INNER JOIN Posts ON Posts.creator = Users.userID`, (error, rows) => {
                            if (!error) {
                                posts = posts.map((post) => {
                                    const creator = Array.from(rows).filter(((creator) => creator.postID === post.postID));

                                    return ({
                                        ...post,
                                        "creator": {
                                            "userID": creator.userID,
                                            "userName": creator.userName
                                        }
                                    });
                                });

                                connection.query(`SELECT * FROM PostLikes`, (error, rows) => {
                                    if (!error) {
                                        posts = posts.map((post) => {
                                            const likesData = Array.from(rows).filter((like) => like.postID === post.postID),
                                                likes = [];

                                            likesData.forEach((like) => {
                                                likes.push({ userID: like.userID });
                                            });

                                            return ({
                                                ...post,
                                                "likes": likes,
                                                "likesCount": likes.length
                                            });
                                        });

                                        return res.status(200).json({
                                            "success": true,
                                            "count": posts.length,
                                            "posts": posts
                                        });
                                    } else {
                                        return res.status(502).json({
                                            "success": false,
                                            "message": error
                                        });
                                    }
                                });
                            } else {
                                return res.status(502).json({
                                    "success": false,
                                    "message": error
                                });
                            }
                        });
                    }
                });
            }
        });
    }
};

export { getPosts, createNewPost, updatePost, deletePost, likePost, disLikePost, getPostsBySearch, getPostByID }; 