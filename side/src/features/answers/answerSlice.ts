// features/answers/answerSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Answer {
  question_id: number;
  value: string;
}

interface AnswerState {
  answers: Answer[];
}

const initialState: AnswerState = {
  answers: [],
};

const answerSlice = createSlice({
  name: "answers",
  initialState,
  reducers: {
    setAnswer: (state, action: PayloadAction<Answer>) => {
      const { question_id, value } = action.payload;

      const existingAnswer = state.answers.find(
        (answer) => answer.question_id === question_id
      );

      if (existingAnswer) {
        // Update the existing answer
        existingAnswer.value = value;
      } else {
        // Add new answer
        state.answers.push(action.payload);
      }
    },
    resetAnswers: (state) => {
      state.answers = [];
    },
  },
});

export const { setAnswer, resetAnswers } = answerSlice.actions;

export default answerSlice.reducer;
