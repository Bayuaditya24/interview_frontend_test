import React, { useState } from "react";
import {
  TextField,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
  Container,
  Paper,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addQuestion } from "../features/questions/questionSlice";
import { AppDispatch, RootState } from "../app/store";

const CHOICE_TYPES = [
  "short answer",
  "paragraph",
  "date",
  "multiple choice",
  "dropdown",
  "checkboxes",
];

const AddQuestion: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.questions);

  const [name, setName] = useState("");
  const [choiceType, setChoiceType] = useState("");
  const [choices, setChoices] = useState<string[]>([""]);
  const [isRequired, setIsRequired] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const addChoiceField = () => setChoices([...choices, ""]);
  const removeChoiceField = (index: number) =>
    setChoices(choices.filter((_, i) => i !== index));

  const token = localStorage.getItem("token");

  const handleSubmit = async () => {
    if (!slug) return;
    const payload = {
      name,
      choice_type: choiceType,
      is_required: isRequired,
      choices: ["multiple choice", "dropdown", "checkboxes"].includes(
        choiceType
      )
        ? choices
        : [],
    };
    const res = await dispatch(addQuestion({ slug, data: payload }));

    if (addQuestion.fulfilled.match(res)) {
      setSuccessMsg("Question added successfully.");
      setName("");
      setChoiceType("");
      setChoices([""]);
      setIsRequired(false);
    }
  };

  const requiresChoices = [
    "multiple choice",
    "dropdown",
    "checkboxes",
  ].includes(choiceType);

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, borderRadius: 2 }} elevation={3}>
        <Typography variant="h5" align="center" fontWeight={600} gutterBottom>
          Add a New Question
        </Typography>

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Question Name"
          value={name}
          fullWidth
          margin="normal"
          onChange={(e) => setName(e.target.value)}
          size="small"
        />

        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Choice Type</InputLabel>
          <Select
            value={choiceType}
            label="Choice Type"
            onChange={(e) => setChoiceType(e.target.value)}
          >
            {CHOICE_TYPES.map((type) => (
              <MenuItem value={type} key={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {requiresChoices && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={500}>
              Choices
            </Typography>
            {choices.map((choice, index) => (
              <Stack direction="row" spacing={1} key={index} sx={{ mt: 1 }}>
                <TextField
                  value={choice}
                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                  fullWidth
                  label={`Choice ${index + 1}`}
                  size="small"
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeChoiceField(index)}
                  size="small"
                  sx={{ height: "fit-content" }}
                >
                  X
                </Button>
              </Stack>
            ))}
            <Button
              onClick={addChoiceField}
              size="small"
              sx={{ mt: 2, paddingX: 3 }}
            >
              Add Choice
            </Button>
          </Box>
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              size="small"
            />
          }
          label="Required"
          sx={{ mt: 2 }}
        />

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            {loading ? "Saving..." : "Add Question"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddQuestion;
