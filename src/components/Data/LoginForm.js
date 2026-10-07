import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { SERVER_URL } from "@/config";
import {
  IoEyeOutline,
  IoEyeOffOutline,
  IoLockClosedOutline,
  IoPersonOutline,
  IoHomeOutline,
} from "react-icons/io5";
import { getUser, logout, setAuthSession } from "@/utils/auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setCurrentUser(getUser());
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${SERVER_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setAuthSession({
          token: data.token,
          username: data.username,
          userType: data.userType || "user",
          userId: data.userId,
        });

        const isAdmin = (data.userType || "").toLowerCase() === "admin";
        if (isAdmin) {
          router.push("/seriallist");
        } else {
          router.push("/useSerials");
        }
      } else {
        setError(data.message || "Invalid username or password. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the authentication service. Please check your network or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0F172A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        backgroundImage:
          "radial-gradient(at 0% 0%, rgba(16, 124, 65, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(30, 41, 59, 0.8) 0px, transparent 50%)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
          bgcolor: "#1E293B",
          color: "#FFFFFF",
          border: "1px solid #334155",
        }}
      >
        {/* Navigation Bar / Back to Home */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Link href="/" passHref style={{ textDecoration: "none" }}>
            <Button
              startIcon={<IoHomeOutline size={16} />}
              size="small"
              sx={{
                color: "#94A3B8",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.85rem",
                "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255, 255, 255, 0.05)" },
              }}
            >
              Home
            </Button>
          </Link>
        </Box>

        {/* Brand Logo & Title */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Link href="/" passHref style={{ textDecoration: "none" }}>
            <Image
              src="/safaricom-logo1.png"
              alt="Safaricom Logo"
              width={160}
              height={36}
              style={{ filter: "brightness(0) invert(1)", cursor: "pointer" }}
              priority
            />
          </Link>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 2, color: "#FFFFFF" }}>
            Admin Portal
          </Typography>
          <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.5, textAlign: "center" }}>
            Sign in with admin credentials to access Audit Reports & serial management
          </Typography>
        </Box>

        {currentUser && (
          <Alert
            severity="info"
            sx={{
              mb: 2.5,
              borderRadius: 2,
              bgcolor: "rgba(16, 124, 65, 0.15)",
              color: "#E2E8F0",
              border: "1px solid rgba(16, 124, 65, 0.4)",
              "& .MuiAlert-icon": { color: "#107C41" },
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  logout();
                  setCurrentUser(null);
                }}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.75rem" }}
              >
                Sign Out
              </Button>
            }
          >
            Signed in as <strong>{currentUser.username}</strong>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IoPersonOutline color="#94A3B8" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#0F172A",
                color: "#FFFFFF",
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#107C41" },
                "&.Mui-focused fieldset": { borderColor: "#107C41" },
              },
              "& .MuiInputLabel-root": { color: "#94A3B8" },
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IoLockClosedOutline color="#94A3B8" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: "#94A3B8" }}
                  >
                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#0F172A",
                color: "#FFFFFF",
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#107C41" },
                "&.Mui-focused fieldset": { borderColor: "#107C41" },
              },
              "& .MuiInputLabel-root": { color: "#94A3B8" },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.4,
              bgcolor: "#107C41",
              fontWeight: 700,
              fontSize: "1rem",
              borderRadius: 2,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(16, 124, 65, 0.4)",
              "&:hover": { bgcolor: "#0B532B" },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "#FFFFFF" }} /> : "Sign In"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
