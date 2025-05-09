import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthState } from "./authTypes";
import { loginAPI } from "./authAPI";

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  email: null,
  username: null,
  id: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const data = await loginAPI(email, password); 
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token); 
      return {
        token: data.token,
        username: data.user.username,
        email: data.user.email,
        id: data.user.id,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.email = action.payload.email;
        state.username = action.payload.username;
        state.id = action.payload.id;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.email = null;
        state.username = null;
        state.loading = false;
        state.error = null;
        localStorage.removeItem("token");
      });
  },
});

export default authSlice.reducer;
