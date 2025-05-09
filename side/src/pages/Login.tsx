import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import { RootState, AppDispatch } from "../app/store";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, error, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate("/");
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(to bottom, #003366, #1a237e)",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 300,
            minHeight: 300,
          }}
        >
          <Typography variant="h5" gutterBottom align="center" fontWeight={600}>
            Login
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              sx={{ marginBottom: 2 }}
              size="small"
            />
            <TextField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              fullWidth
              margin="normal"
              required
              variant="outlined"
              size="small"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box mt={10}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#003366", 
                  "&:hover": {
                    backgroundColor: "#1a237e", 
                  },
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Login"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
