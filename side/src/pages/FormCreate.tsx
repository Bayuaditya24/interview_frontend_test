import React, { useState } from "react";
import {
  TextField,
  Typography,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Alert,
  Container,
  Paper,
  Grid,
  Stack,
} from "@mui/material";

const FormCreate: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    allowedDomains: "",
    limitOneResponse: false,
  });
  const [error, setError] = useState("");

  // Function to extract domain from email
  const extractDomainFromEmail = (email: string): string => {
    const domain = email.split("@")[1];
    if (domain) {
      return domain.replace(/^www\./i, "").toLowerCase();
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) {
      setError("Name and slug are required.");
      return;
    }

    try {
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in.");
        return;
      }

      const allowedDomainsArray = form.allowedDomains
        .split(",")
        .map((domain) => {
          let processed = domain.trim().toLowerCase();
          if (processed.includes("@")) {
            processed = extractDomainFromEmail(processed);
          }
          return processed.replace(/^www\./, "");
        })
        .filter((d) => d !== "");

      const response = await fetch("http://localhost:3001/api/v1/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          allowed_domains: allowedDomainsArray,
          limit_one_response: form.limitOneResponse,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to create form.");
        console.error("Server validation errors:", data.errors);
        return;
      }

      const result = await response.json();
      console.log("Form created:", result);
      alert("Form successfully created!");

      // Reset form
      setForm({
        name: "",
        slug: "",
        description: "",
        allowedDomains: "",
        limitOneResponse: false,
      });
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, borderRadius: 2 }} elevation={3}>
        <Typography variant="h5" align="center" fontWeight={600} gutterBottom>
          Create a New Form
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Form Name"
          name="name"
          fullWidth
          margin="normal"
          required
          value={form.name}
          onChange={handleChange}
          size="small"
        />

        <TextField
          label="Slug"
          name="slug"
          fullWidth
          margin="normal"
          required
          value={form.slug}
          onChange={handleChange}
          size="small"
        />

        <TextField
          label="Description"
          name="description"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          value={form.description}
          onChange={handleChange}
          size="small"
        />

        <TextField
          label="Allowed Domains"
          name="allowedDomains"
          fullWidth
          margin="normal"
          value={form.allowedDomains}
          onChange={handleChange}
          size="small"
          helperText="Separate multiple domains with commas. (e.g., domain1.com, domain2.com, user@domain3.com)"
        />

        <FormControlLabel
          control={
            <Switch
              name="limitOneResponse"
              checked={form.limitOneResponse}
              onChange={handleChange}
              size="small"
            />
          }
          label="Limit to 1 response"
        />

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Create Form
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default FormCreate;
