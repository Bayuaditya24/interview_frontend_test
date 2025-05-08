import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Home from "./pages/Home";
import FormCreate from "./pages/FormCreate";
import AddQuestion from "./pages/AddQuestion";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import FormDetail from "./pages/FormDetail";
import FormResponse from "./pages/FormResponse";
import AnswerForm from "./pages/AnswerForm";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Redirect root "/" ke Home dalam layout utama jika sudah login */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="form" element={<FormCreate />} />
        <Route path="detail/:slug" element={<FormDetail />} />
        <Route path="/response/:slug" element={<FormResponse />} />
        <Route path="/forms/:slug/answer" element={<AnswerForm />} />
        <Route path="forms/:slug/add-question" element={<AddQuestion />} />
      </Route>

      {/* Halaman login */}
      <Route path="/login" element={<Login />} />

      {/* Fallback: jika tidak cocok route, redirect ke / */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
