import React, { useEffect, useState } from "react";
import { TextField, Button, Box, Paper, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { SERVER_URL } from "@/config";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [token, setToken] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Check if the user is already logged in
  useEffect(() => {
    const loggedInToken = localStorage.getItem("token");
    if (loggedInToken) {
      setToken(loggedInToken);
      // Redirect to the dashboard or any other route
      // router.push('/view-data'); // Replace with your actual dashboard route
    }
  }, []);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      console.log("Response Status:", response.status);

      if (response.ok) {
        const data = await response.json();
        const token = data.token;

        // Store the token in localStorage or a secure storage method
        localStorage.setItem("token", token);

        setToken(token);

        console.log("Login successful", data);
        console.log("Token Value", token);

        // Redirect to the dashboard page or any other route
        router.push("/seriallist"); // Replace with your actual dashboard route
      } else {
        console.log("Login failed", response);

        setError("check your username or password and try again");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("An error occurred while logging in.");
    }
  };

  console.log("Username:", username);
  console.log("Password:", password);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Paper
        elevation={3}
        style={{ padding: "20px" }}
        xs={12}
        sm={8}
        md={4}
        xl={3}
      >
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="h4">Login</Typography>
        </Box>

        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          margin="normal"
          value={username}
          onChange={handleUsernameChange}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={handlePasswordChange}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
        >
          Login
        </Button>
        {error && (
          <Typography
            variant="body2"
            color="error"
            style={{ marginTop: "10px" }}
          >
            {error}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Login;
