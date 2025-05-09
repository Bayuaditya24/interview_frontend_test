import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


export interface Question {
  id?: number;
  name: string;
  choice_type: string;
  choices?: string[];
  is_required: boolean;
  form_id?: number;
}

interface QuestionState {
  questions: Question[]; 
  questionsByForm: {
    [slug: string]: Question[]; 
  };
  loading: boolean;
  error: string | null;
}

const initialState: QuestionState = {
  questions: [],
  questionsByForm: {},
  loading: false,
  error: null,
};


export const fetchQuestions = createAsyncThunk(
  "questions/fetchQuestions",
  async (slug: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await axios.get(
        `http://localhost:3001/api/v1/forms/${slug}/questions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { slug, questions: res.data.questions || [] };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          "An error occurred while fetching the questions"
      );
    }
  }
);

export const addQuestion = createAsyncThunk(
  "questions/addQuestion",
  async (
    {
      slug,
      data,
    }: {
      slug: string;
      data: Question;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await axios.post(
        `http://localhost:3001/api/v1/forms/${slug}/questions`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data.question;
    } catch (err: any) {
      console.error("Error adding question: ", err.response?.data);
      return rejectWithValue(
        err.response?.data?.message ||
          "An error occurred while adding the question"
      );
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  "questions/deleteQuestion",
  async (
    {
      slug,
      questionId,
    }: {
      slug: string;
      questionId: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      await axios.delete(
        `http://localhost:3001/api/v1/forms/${slug}/questions/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { slug, questionId };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete question"
      );
    }
  }
);

const questionSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questionsByForm[action.payload.slug] = action.payload.questions;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.loading = false;
        const slug = action.payload.form_id?.toString();
        if (slug) {
          if (!state.questionsByForm[slug]) {
            state.questionsByForm[slug] = [];
          }
          state.questionsByForm[slug].push(action.payload);
        }
      })
      .addCase(addQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.loading = false;
        const { slug, questionId } = action.payload;
        if (state.questionsByForm[slug]) {
          state.questionsByForm[slug] = state.questionsByForm[slug].filter(
            (q) => q.id !== questionId
          );
        }
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default questionSlice.reducer;
