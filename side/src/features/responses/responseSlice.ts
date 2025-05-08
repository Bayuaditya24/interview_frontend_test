// features/responses/responseSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface Answer {
  question_id: number;
  value: string;
}

interface ResponseState {
  submitting: boolean;
  success: boolean;
  error: string | null;
}

const initialState: ResponseState = {
  submitting: false,
  success: false,
  error: null,
};

export const submitFormResponse = createAsyncThunk(
  "responses/submitFormResponse",
  async (
    {
      slug,
      answers,
    }: {
      slug: string;
      answers: Answer[];
    },
    thunkAPI
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue({ message: "Token is missing" });
      }

      const response = await axios.post(
        `http://localhost:3001/api/v1/forms/${slug}/responses`,
        { answers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { message: err.message || "Unknown error" }
      );
    }
  }
);

const responseSlice = createSlice({
  name: "responses",
  initialState,
  reducers: {
    resetResponseState: (state) => {
      state.submitting = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitFormResponse.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitFormResponse.fulfilled, (state) => {
        state.submitting = false;
        state.success = true;
      })
      .addCase(submitFormResponse.rejected, (state, action) => {
        state.submitting = false;
        const payload = action.payload as { message: string };
        state.error = payload?.message || "Submit failed";
        state.success = false;
      });
  },
});

export const { resetResponseState } = responseSlice.actions;
export default responseSlice.reducer;
