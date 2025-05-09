import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface Form {
  id: number;
  name: string;
  slug: string;
  description: string;
  creator_id: number;
  allowed_domains: string[];
}

interface FormDetail extends Form {
  limit_one_response: number;
  creator_id: number;
  allowed_domains: string[];
  questions: {
    id: number;
    form_id: number;
    name: string;
    choice_type: string;
    choices: string | null;
    is_required: number;
  }[];
  responses?: {
    user_id: string;
    answers: {
      question_id: number;
      value: string;
    }[];
  }[];
}

interface FormState {
  forms: Form[];
  formDetail: FormDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: FormState = {
  forms: [],
  formDetail: null,
  loading: false,
  error: null,
};

export const fetchForms = createAsyncThunk(
  "forms/fetchForms",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/v1/forms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.forms;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);


export const fetchFormDetail = createAsyncThunk(
  "forms/fetchFormDetail",
  async (slug: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/v1/forms/${slug}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.form;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const updateAllowedDomains = createAsyncThunk(
  "forms/updateAllowedDomains",
  async (data: { formId: number; allowedDomains: string[] }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:3001/api/v1/forms/${data.formId}`,
        {
          allowed_domains: data.allowedDomains,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.form;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const fetchFormResponses = createAsyncThunk(
  "forms/fetchFormResponses",
  async (slug: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/api/v1/forms/${slug}/responses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.responses;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const formSlice = createSlice({
  name: "forms",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = action.payload;
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFormDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.formDetail = null;
      })
      .addCase(fetchFormDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.formDetail = action.payload;
      })
      .addCase(fetchFormDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.formDetail = null;
      })
      .addCase(fetchFormResponses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormResponses.fulfilled, (state, action) => {
        if (state.formDetail) {
          state.formDetail = {
            ...state.formDetail,
            responses: action.payload,
            limit_one_response: state.formDetail.limit_one_response ?? 0, 
          };
        }
      })
      .addCase(fetchFormResponses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default formSlice.reducer;
