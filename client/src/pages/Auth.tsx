import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../index';

import { Avatar, Box, Paper, Typography, Container, Grid, Button } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

import Input from '../components/Input';
import GoogleIcon from '../components/GoogleIcon';

import { login } from '../actions/users';

interface FormData {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    cfmPassword: string
};

interface IsValidData {
    firstName: boolean,
    lastName: boolean,
    email: boolean,
    password: boolean,
    cfmPassword: boolean
}

interface Errors {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    cfmPassword: string
}

const Auth: React.FC = () => {
    const [isSignUp, setIsSignUp] = React.useState<boolean>(false),
        [showPassword, setShowPassword] = React.useState<boolean>(false),
        [formData, setFormData] = React.useState<FormData>({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            cfmPassword: ""
        }),
        [isValidData, setIsValidData] = React.useState<IsValidData>({
            firstName: false,
            lastName: false,
            email: false,
            password: false,
            cfmPassword: false
        }),
        [errors, setErrors] = React.useState<Errors>({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            cfmPassword: ""
        }),
        navigate = useNavigate(),
        dispatch = useDispatch<AppDispatch>();

    React.useEffect(() => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            cfmPassword: ""
        });

        setIsValidData({
            firstName: false,
            lastName: false,
            email: false,
            password: false,
            cfmPassword: false
        });

        setErrors({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            cfmPassword: ""
        });
    }, [isSignUp]); 

    const handleShowPassword = () => {
        setShowPassword((showPassword) => !showPassword);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setFormData((formData) => {
            return {
                ...formData,
                [name]: value
            }
        });
    };

    const validateFirstName = (firstName: string) => {
        let isValidFirstName = false;

        if (firstName === "") {
            setIsValidData((isValidData) => {
                return {
                    ...isValidData,
                    firstName: true 
                };
            });

            setErrors((errors) => {
                return {
                    ...errors,
                    firstName: "Invalid First Name"
                }
            });
        } else {
            isValidFirstName = true;

            setIsValidData((isValidData) => {
                return {
                    ...isValidData,
                    firstNam: false 
                };
            });

            setErrors((errors) => {
                return {
                    ...errors,
                    firstNam: ""
                }
            });
        }

        return isValidFirstName;
    };

    const validateLastName = (lastName: string) => {
        let isValidLastName = false;

        if (lastName === "") {
            setIsValidData((isValidData) => {
                return {
                    ...isValidData,
                    lastName: true 
                };
            });

            setErrors((errors) => {
                return {
                    ...errors,
                    lastName: "Invalid Last Name"
                }
            });
        } else {
            isValidLastName = true;

            setIsValidData((isValidData) => {
                return {
                    ...isValidData,
                    lastName: false 
                };
            });

            setErrors((errors) => {
                return {
                    ...errors,
                    firstName: ""
                }
            });
        }

        return isValidLastName;
    };

    const validateEmail = (email: string) => {
        let isValidEmail = false;

        if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(formData.email)) {
            setIsValidData((isValidData) => {
                return {
                    ...isValidData,
                    email: true 
                };
            });

            setErrors((errors) => {
                return {
                    ...errors,
                    email: "Invalid Email Address"
                }
            });
        } else {
            isValidEmail = true;

            setIsValidData((isValidData) => {
                return {
                    ...isValidData,
                    email: false 
                };
            });

            setErrors((errors) => {
                return {
                    ...errors,
                    email: ""
                }
            });
        }

        return isValidEmail;
    };

    const validatePassword = (password: string) => {
        let isValidPassword = false;

        if (password.length <= 4) {
            setIsValidData((isValidData) => {
                return {
                    ...isValidData,
                    password: true 
                };
            });

            setErrors((errors) => {
                return {
                    ...errors,
                    password: "The length of password should be greater then 4"
                }
            });
        } else {
            isValidPassword = true;

            setIsValidData((isValidData) => {
                return {
                    ...isValidData,
                    password: false 
                };
            });

            setErrors((errors) => {
                return {
                    ...errors,
                    password: ""
                }
            });
        }

        return isValidPassword;
    };

    const validateCfmPassword = (password: string, cfmPassword: string) => {
        let isValidCfmPassword = false;

        if (cfmPassword !== password) {
            setIsValidData((isValidData) => {
                return {
                    ...isValidData,
                    cfmPassword: true 
                };
            });

            setErrors((errors) => {
                return {
                    ...errors,
                    cfmPassword: "Password must be same"
                }
            });
        } else {
            isValidCfmPassword = true;

            setIsValidData((isValidData) => {
                return {
                    ...isValidData,
                    cfmPassword: false 
                };
            });

            setErrors((errors) => {
                return {
                    ...errors,
                    cfmPassword: ""
                }
            });
        }

        return isValidCfmPassword;
    };

    const registerUser = async () => {
        try {
            const response = await fetch('http://localhost:5000/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    "firstName": formData.firstName,
                    "lastName": formData.lastName,
                    "email": formData.email,
                    "password": formData.password
                })
            });

            if (response.status === 409) {
                setIsValidData((isValidData) => {
                    return {
                        ...isValidData,
                        email: true
                    };
                });

                setErrors((errors) => {
                    return {
                        ...errors,
                        email: "Email Address is already Registered"
                    }
                });
            }

            return response.json();
        } catch (error) {
            console.log(error);
        }
    };

    const handleSignUp = () => {
        const isValidFirstName: boolean = validateFirstName(formData.firstName),
            isValidLastName: boolean = validateLastName(formData.lastName),
            isValidEmail: boolean = validateEmail(formData.email),
            isValidPassword: boolean = validatePassword(formData.password),
            isValidCfmPassword: boolean = validateCfmPassword(formData.password, formData.cfmPassword);

        if (isValidFirstName && isValidLastName && isValidEmail && isValidPassword && isValidCfmPassword) {
            registerUser().then((data) => {
                if (data.success) {
                    dispatch(login({
                        userID: data.user.userID, 
                        userName: data.user.userName,
                        profilePicture: data.user.profilePicture 
                    }));
                    navigate('/posts'); 
                }
            }).catch((error) => {
                console.log(error);
            });
        }
    };

    const loginUser = async () => {
        try {
            const response = await fetch('http://localhost:5000/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    "email": formData.email,
                    "password": formData.password
                })
            });

            if (response.status === 401) {
                setIsValidData((isValidData) => {
                    return {
                        ...isValidData,
                        email: true,
                        password: true
                    }
                });

                setErrors((errors) => {
                    return {
                        ...errors,
                        email: "Incorrect email or password",
                        password: "Incorrect email or password" 
                    }
                });
            }

            return response.json();
        } catch (error) {
            console.log(error); 
        }
    };

    const handleSignIn = () => {
        const isValidEmail: boolean = validateEmail(formData.email),
            isValidPassword: boolean = validatePassword(formData.password);

        if (isValidEmail && isValidPassword) {
            loginUser().then((data) => {
                if (data.success) {
                    dispatch(login({
                        userID: data.user.userID,
                        userName: data.user.userName,
                        profilePicture: data.user.profilePicture 
                    }));

                    navigate('/posts'); 
                }
            }).catch((error) => {
                console.log(error);
            });
        }
    };

    const googleOAuth = async () => {
        try {
            const response = await fetch('http://localhost:5000/users/auth');
            return response.json();
        } catch (error) {
            console.log(error);
        }
    }

    const handleGoogleAuth = () => {
        googleOAuth().then((data) => {
            console.log(data);
            navigate('/posts');
        }).catch((error) => {
            console.log(error);
        });
    };

    return (
        <Container
            maxWidth="xs"
            sx={{
                marginTop: 2
            }}
        >
            <Paper
                sx={{
                    padding: 2
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <Avatar sx={{ backgroundColor: "purple" }}>
                        <LockOutlined />
                    </Avatar>
                    <Typography variant='h6'>{isSignUp ? "Sign Up" : "Sign In"}</Typography>

                    <Grid container spacing={1.5} marginTop={2}>
                        {
                            isSignUp &&
                            <>
                                <Input
                                    name="firstName"
                                    label="First Name"
                                    type="text"
                                    handleChange={handleChange}
                                    error={isValidData.firstName}
                                    helperText={errors.firstName}
                                    value={formData.firstName}
                                    half
                                    autoFocus
                                />
                                <Input
                                    name="lastName"
                                    label="Last Name"
                                    type="text"
                                    handleChange={handleChange}
                                    error={isValidData.lastName}
                                    helperText={errors.lastName}
                                    value={formData.lastName}
                                    half
                                />
                            </>
                        }

                        <Input
                            name="email"
                            label="Email"
                            type="email"
                            autoFocus={isSignUp ? false : true}
                            error={isValidData.email}
                            handleChange={handleChange}
                            helperText={errors.email}
                            value={formData.email}
                        />

                        <Input
                            name="password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            handleChange={handleChange}
                            error={isValidData.password}
                            helperText={errors.password}
                            value={formData.password}
                            showPassword={showPassword}
                            handleShowPassword={handleShowPassword}
                        />

                        {
                            isSignUp &&
                            <Input
                                name="cfmPassword"
                                label="Confirm Password"
                                type="password"
                                error={isValidData.cfmPassword}
                                helperText={errors.cfmPassword}
                                value={formData.cfmPassword}
                                handleChange={handleChange}
                            />
                        }
                    </Grid>

                    {
                        !isSignUp &&
                        <Typography
                            variant="body2"
                            fontWeight={500}
                            color="primary"
                            component={Link}
                            to='/'
                            alignSelf="flex-end"
                            sx={{
                                textDecoration: "none",
                                marginTop: 1.5
                            }}
                        >Forgot Password?</Typography>
                    }

                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={isSignUp ? handleSignUp : handleSignIn}
                        sx={{
                            marginTop: 1.5
                        }}
                        fullWidth
                    >{isSignUp ? "sign up" : "sign in"}</Button>

                    <Typography textTransform="uppercase" fontSize={12} padding={1.5}>or</Typography>

                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleAuth}
                        fullWidth
                    >{isSignUp ? "sign up with google" : "sign in with google"}</Button>

                    <Typography
                        variant="body2"
                        marginTop={2}
                        sx={{
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        {isSignUp ? "Already have an account? " : "Don't have an account?"}
                        <Typography
                            component="button"
                            textTransform="uppercase"
                            variant="body2"
                            color="primary"
                            fontWeight={600}
                            sx={{
                                cursor: "pointer",
                                marginLeft: 0.5,
                                background: "none",
                                outline: "none",
                                border: "none"
                            }}
                            onClick={() => setIsSignUp((isSignUp) => !isSignUp)}
                        >{isSignUp ? "sign in" : "sign up"}</Typography>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Auth; 