import React from 'react';

import { Grid, TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface InputProps {
    name: string,
    label: string,
    type: string,
    half?: boolean
    autoFocus?: boolean,
    showPassword?: boolean,
    error: boolean, 
    helperText: string,
    value: string,
    required?: boolean,
    handleShowPassword?: () => void,
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void 
};

const Input: React.FC<InputProps> = ({ name, label, type, half, autoFocus, showPassword, error, helperText, required, value, handleShowPassword, handleChange }) => {
    return (
        <Grid item xs={12} sm={half ? 6 : 12}>
            <TextField
                size="small"
                type={type}
                value={value}
                name={name}
                label={label}
                error={error}
                helperText={helperText}
                autoComplete="off"
                autoFocus={autoFocus}
                InputProps={{
                    endAdornment: name === "password" && 
                        <InputAdornment position="end">
                            <IconButton edge="end" onClick={handleShowPassword}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                }}
                onChange={handleChange}
                required={required}
                fullWidth
            />
        </Grid>
    );
};

export default Input; 