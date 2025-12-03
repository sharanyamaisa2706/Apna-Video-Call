import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";   


const defaultTheme = createTheme();

export default function Authentication() {

    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const [name, setName] = React.useState();
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();
    const [formstate, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const navigate = useNavigate();  

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            // ------------------------ REGISTER ------------------------
            if (formstate === 1) {
                let result = await handleRegister(name, username, password);
                setMessage(result);
                setUsername("");
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
            }

            // ------------------------ LOGIN ------------------------
            if (formstate === 0) {
                let result = await handleLogin(username, password);

                if (result === "Login successful") {
                    navigate("/home");  
                } else {
                    setError(result);   
                }
            }

        } catch (err) {
            console.log(err);
            setError("Something went wrong");
        }
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />

                {/* Left side with background image */}
                <Grid
                    item
                    xs={12} sm={4} md={7}
                    sx={{
                        height: '100vh',
                        backgroundImage: `url("/logo5.jpg")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />

                {/* Right side - login/signup form */}
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <div style={{ marginBottom: "16px" }}>
                            <Button
                                variant={formstate === 0 ? "contained" : "outlined"}
                                onClick={() => setFormState(0)}
                                sx={{ mr: 1 }}
                            >
                                Sign In
                            </Button>

                            <Button
                                variant={formstate === 1 ? "contained" : "outlined"}
                                onClick={() => setFormState(1)}
                            >
                                Sign Up
                            </Button>
                        </div>

                        <Box sx={{ mt: 3, width: "100%" }}>

                            {formstate === 1 &&
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    margin="normal"
                                    onChange={e => setName(e.target.value)}
                                />
                            }

                            <TextField
                                margin="normal"
                                fullWidth
                                required
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus
                                onChange={e => setUsername(e.target.value)}
                            />

                            <TextField
                                margin="normal"
                                fullWidth
                                type="password"
                                label="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />

                            <p style={{ color: "red" }}>{error}</p>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleAuth}
                                sx={{ mt: 2 }}
                            >
                                {formstate === 0 ? "Login" : "Register"}
                            </Button>
                        </Box>

                    </Box>
                </Grid>
            </Grid>

            <Snackbar open={open} autoHideDuration={4000} message={message} />
        </ThemeProvider>
    );
}
