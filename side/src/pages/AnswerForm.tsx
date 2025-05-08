import React, { useEffect, useState } from "react";
import {
  Typography,
  TextField,
  TextareaAutosize,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Button,
  Container,
  Box,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFormDetail } from "../features/form/formSlice";
import { RootState, AppDispatch } from "../app/store";

const AnswerForm: React.FC = () => {
  const { slug } = useParams();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { formDetail, loading, error } = useSelector(
    (state: RootState) => state.forms
  );

  const [answers, setAnswers] = useState<any>({});

  useEffect(() => {
    if (slug) {
      dispatch(fetchFormDetail(slug));
    }
  }, [slug, dispatch]);

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers((prev: any) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const isSubmitDisabled = (): boolean => {
    if (!formDetail?.questions) return true;

    return formDetail.questions.some((q) => {
      if (!q.is_required) return false;
      const answer = answers[q.id];
      switch (q.choice_type) {
        case "short answer":
        case "paragraph":
        case "date":
        case "multiple choice":
        case "dropdown":
          return !answer || answer.trim?.() === "";
        case "checkboxes":
          return !Array.isArray(answer) || answer.length === 0;
        default:
          return false;
      }
    });
  };

  const handleSubmit = async () => {
    if (!formDetail?.questions) return;

    const answerArray = formDetail.questions.map((question) => {
      const value = answers[question.id];
      let answerValue = Array.isArray(value) ? value.join(", ") : value;
      return { question_id: question.id, value: answerValue };
    });

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Anda belum login.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/forms/${slug}/responses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers: answerArray }),
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        alert("Jawaban berhasil dikirim!");
        navigate("/");
      } else if (response.status === 422) {
        alert(`Gagal: ${data.message}`);
        console.error("Validation Errors:", data.errors);
      } else if (response.status === 403) {
        alert("Akses ditolak: Domain email tidak diperbolehkan.");
      } else {
        alert("Gagal: Terjadi kesalahan.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Terjadi kesalahan saat mengirim jawaban.");
    }
  };

  const renderQuestionInput = (question: any) => {
    const commonProps = {
      fullWidth: true,
      size: "small" as const,
      value: answers[question.id] || "",
      onChange: (e: any) => handleAnswerChange(question.id, e.target.value),
      required: question.is_required === 1,
    };

    switch (question.choice_type) {
      case "short answer":
        return <TextField variant="outlined" {...commonProps} />;
      case "paragraph":
        return (
          <TextareaAutosize
            minRows={4}
            style={{
              width: "100%",
              padding: 10,
              fontSize: 14,
              borderRadius: 4,
              borderColor: "#ccc",
            }}
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );
      case "date":
        return (
          <TextField
            type="date"
            variant="outlined"
            {...commonProps}
            InputLabelProps={{ shrink: true }}
          />
        );
      case "multiple choice":
        return (
          <RadioGroup
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          >
            {question.choices?.split(",").map((choice: string, idx: number) => (
              <FormControlLabel
                key={idx}
                value={choice}
                control={<Radio size="small" />}
                label={choice.trim()}
              />
            ))}
          </RadioGroup>
        );
      case "dropdown":
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{question.name}</InputLabel>
            <Select
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              label={question.name}
            >
              {question.choices
                ?.split(",")
                .map((choice: string, idx: number) => (
                  <MenuItem key={idx} value={choice}>
                    {choice.trim()}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        );
      case "checkboxes":
        return (
          <FormGroup>
            {question.choices?.split(",").map((choice: string, idx: number) => (
              <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    size="small"
                    checked={answers[question.id]?.includes(choice)}
                    onChange={(e) => {
                      const updated = answers[question.id] || [];
                      if (e.target.checked) {
                        handleAnswerChange(question.id, [...updated, choice]);
                      } else {
                        handleAnswerChange(
                          question.id,
                          updated.filter((v: string) => v !== choice)
                        );
                      }
                    }}
                  />
                }
                label={choice.trim()}
              />
            ))}
          </FormGroup>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ marginBottom: 2 }}>
          {formDetail?.name || "Loading..."}
        </Typography>

        {loading && (
          <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
        )}
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        <form>
          {!formDetail?.questions || formDetail.questions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No questions available.
            </Typography>
          ) : (
            formDetail.questions.map((question: any) => (
              <Box key={question.id} mb={3}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 500 }}
                  gutterBottom
                >
                  {question.name}
                  {question.is_required === 1 && (
                    <Typography component="span" color="error">
                      {" *"}
                    </Typography>
                  )}
                </Typography>
                {renderQuestionInput(question)}
              </Box>
            ))
          )}

          {formDetail?.questions && formDetail.questions.length > 0 && (
            <Box textAlign="center" mt={4}>
              <Button
                variant="contained"
                color="primary"
                size="medium"
                onClick={handleSubmit}
                disabled={isSubmitDisabled()}
                sx={{ px: 5, py: 1.5, fontWeight: "bold" }}
              >
                Submit Answers
              </Button>
            </Box>
          )}
        </form>
      </Paper>
    </Container>
  );
};

export default AnswerForm;
