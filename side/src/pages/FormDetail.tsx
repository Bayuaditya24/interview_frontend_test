import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFormDetail,
  fetchFormResponses,
} from "../features/form/formSlice";
import { deleteQuestion } from "../features/questions/questionSlice";
import type { RootState, AppDispatch } from "../app/store";
import {
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Stack,
  Container,
  Paper,
  Box,
  TextField,
  IconButton,
  Snackbar,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { FileCopy, ExpandMore, ExpandLess } from "@mui/icons-material";

const FormDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch: AppDispatch = useDispatch();
  const [copied, setCopied] = React.useState(false);

  // State for tracking whether responses are expanded
  const [expanded, setExpanded] = useState(false);

  const { formDetail, loading, error } = useSelector(
    (state: RootState) => state.forms
  );

  // Decode user ID from token
  const token = localStorage.getItem("token");
  let userId: string | null = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.id;
    } catch (e) {
      console.error("Failed to decode token", e);
    }
  }

  useEffect(() => {
    if (slug) {
      dispatch(fetchFormDetail(slug));
      dispatch(fetchFormResponses(slug)); // Fetch form responses
    }
  }, [dispatch, slug]);

  const handleDeleteQuestionById = async (questionId: number) => {
    if (!formDetail) return;
    await dispatch(
      deleteQuestion({
        slug: formDetail.slug,
        questionId,
      })
    );
    dispatch(fetchFormDetail(formDetail.slug)); // Refresh form detail
  };

  const handleCopyLink = () => {
    if (formDetail) {
      const apiLink = `${window.location.origin}/api/v1/forms/${formDetail.slug}`;
      navigator.clipboard.writeText(apiLink).then(() => {
        setCopied(true);
      });
    }
  };

  const handleToggleResponses = () => {
    setExpanded(!expanded);
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!formDetail) return <Alert severity="warning">No form found</Alert>;

  const publicLink = `${window.location.origin}/fill/${formDetail.slug}`;

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Form Title */}
        <Typography variant="h5" gutterBottom fontWeight={600}>
          📄 {formDetail.name}
        </Typography>
        <Typography variant="body1" gutterBottom color="text.secondary">
          {formDetail.description}
        </Typography>

        {/* Form Meta Data */}
        <Box my={2}>
          <Typography variant="body2" color="text.secondary">
            <strong>Slug:</strong> {formDetail.slug} |{" "}
            <strong>Creator ID:</strong> {formDetail.creator_id}
          </Typography>
          <Typography variant="body2" color="text.secondary" my={1}>
            <strong>Limit One Response:</strong>{" "}
            {formDetail.limit_one_response ? "Yes" : "No"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Allowed Domains:</strong>{" "}
            {formDetail.allowed_domains.join(", ")}
          </Typography>
        </Box>

        {/* Form Public Link */}
        <Box mt={4} mb={2}>
          <Typography variant="h6">Form Link:</Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            <TextField
              value={publicLink}
              variant="outlined"
              fullWidth
              size="small"
              InputProps={{ readOnly: true }}
              sx={{
                borderRadius: "8px",

                padding: "8px",
              }}
            />
            <IconButton onClick={handleCopyLink} color="primary">
              <FileCopy />
            </IconButton>
          </Stack>
        </Box>

        <Snackbar
          open={copied}
          autoHideDuration={2000}
          onClose={() => setCopied(false)}
          message="Link copied to clipboard!"
        />

        {/* Questions Section */}
        <Typography variant="h6" mt={4} mb={2} fontWeight={600}>
          Questions:
        </Typography>

        <Paper variant="outlined" sx={{ mb: 4, p: 2, borderRadius: 2 }}>
          <List>
            {formDetail.questions.map((q) => (
              <React.Fragment key={q.id}>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    formDetail.creator_id?.toString() === userId && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteQuestionById(q.id)}
                      >
                        Delete
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={q.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          Type: {q.choice_type}
                        </Typography>
                        {" — "}
                        Required: {q.is_required ? "Yes" : "No"}
                        {" — "}
                        Choices: {q.choices || "-"}
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Responses Section */}
        {formDetail.creator_id?.toString() === userId &&
          Array.isArray(formDetail.responses) &&
          formDetail.responses.length > 0 && (
            <>
              <Button
                variant="contained"
                onClick={handleToggleResponses}
                sx={{
                  mt: 4,
                  mb: 2,
                  width: "auto",
                  display: "flex",
                  alignItems: "center",
                  marginRight: "auto",
                  paddingLeft: 2,
                  paddingRight: 1,
                  borderRadius: "20px", // Rounded button
                }}
              >
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Responses ({formDetail.responses.length})
                </Typography>
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </Button>

              {expanded && (
                <Box>
                  {formDetail.responses.map((response, index) => (
                    <Card key={index} sx={{ mb: 3, borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          🧑‍💻 User ID: {response.user_id}
                        </Typography>
                        <List dense>
                          {response.answers.map((ans, i) => {
                            const question = formDetail.questions.find(
                              (q) => q.id === ans.question_id
                            );
                            return (
                              <ListItem key={i}>
                                <ListItemText
                                  primary={
                                    question?.name ||
                                    `Question ID: ${ans.question_id}`
                                  }
                                  secondary={ans.value}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </>
          )}
      </Paper>
    </Container>
  );
};

export default FormDetail;
