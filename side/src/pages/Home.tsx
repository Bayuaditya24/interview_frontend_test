import React, { useEffect } from "react";
import {
  Typography,
  List,
  ListItem,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Paper,
  Box,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import navigate
import { useDispatch, useSelector } from "react-redux";
import { fetchForms, Form } from "../features/form/formSlice";
import type { RootState, AppDispatch } from "../app/store";

const Home: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let userId: string | null = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.id;
    } catch (e) {
      console.error("Token decoding error:", e);
    }
  }

  const { forms, loading, error } = useSelector(
    (state: RootState) => state.forms
  );

  useEffect(() => {
    dispatch(fetchForms()); // Get the list of forms
  }, [dispatch]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h6" fontWeight={600}>
        📋 Forms
      </Typography>

      {/* Display loading spinner */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Show error message */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* List of forms */}
      <List>
        {forms.map((form: Form) => (
          <Paper
            elevation={3}
            sx={{
              mb: 3,
              p: 3,
              borderRadius: 2,
              boxShadow: 3,
              backgroundColor: "#f9f9f9",
              "&:hover": { boxShadow: 6 },
            }}
            key={form.id}
          >
            <ListItem disablePadding>
              <Box sx={{ width: "100%" }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={2}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {form.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {form.description}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    {form.creator_id?.toString() === userId && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          navigate(`/forms/${form.slug}/add-question`)
                        }
                        sx={{
                          fontWeight: 600,
                          textTransform: "capitalize",
                          borderRadius: "20px",
                          px: 3,
                        }}
                      >
                        Add Question
                      </Button>
                    )}

                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate(`/detail/${form.slug}`)}
                      sx={{
                        fontWeight: 600,
                        textTransform: "capitalize",
                        borderRadius: "20px",
                        backgroundColor: "#1976d2",
                        "&:hover": { backgroundColor: "#1565c0" },
                      }}
                    >
                      Detail
                    </Button>

                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate(`/forms/${form.slug}/answer`)}
                      sx={{
                        fontWeight: 600,
                        textTransform: "capitalize",
                        borderRadius: "20px",
                        backgroundColor: "#388e3c",
                        "&:hover": { backgroundColor: "#2c6e29" },
                      }}
                    >
                      Answer
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </ListItem>
          </Paper>
        ))}
      </List>
    </Container>
  );
};

export default Home;
