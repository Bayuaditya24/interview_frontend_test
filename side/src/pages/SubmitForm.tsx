import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Typography, TextField, Button, Alert, Box } from "@mui/material";

const SubmitForm: React.FC = () => {
  const { slug } = useParams();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!answer) {
      setError("Answer is required.");
      return;
    }
    setError("");
    setSubmitted(true);
    console.log("Submitted answer:", answer);
  };

  return (
    <Box>
      <Typography variant="h5">Submit Form: {slug}</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {submitted ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          Form submitted!
        </Alert>
      ) : (
        <>
          <TextField
            label="Your Answer"
            fullWidth
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            margin="normal"
            required
          />
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </>
      )}
    </Box>
  );
};

export default SubmitForm;
