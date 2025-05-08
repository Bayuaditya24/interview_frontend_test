// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "../components/sidebarSlice";
import authReducer from "../features/auth/authSlice";
import formReducer from "../features/form/formSlice";
import questionReducer from "../features/questions/questionSlice";
import responseReducer from "../features/responses/responseSlice";
import answerReducer from "../features/answers/answerSlice";

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    auth: authReducer,
    forms: formReducer,
    questions: questionReducer,
    responses: responseReducer,
    answers: answerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
