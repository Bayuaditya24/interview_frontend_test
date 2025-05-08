import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchFormDetail } from "../features/form/formSlice";
import {
  submitFormResponse,
  resetResponseState,
} from "../features/responses/responseSlice";
import { useParams } from "react-router-dom";

const FormResponse = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { formDetail, loading } = useAppSelector((state) => state.forms);
  const { submitting, success, error } = useAppSelector(
    (state) => state.responses
  );

  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isDomainValid, setIsDomainValid] = useState<boolean>(true);

  useEffect(() => {
    if (slug) {
      dispatch(fetchFormDetail(slug));
      dispatch(resetResponseState());
    }
  }, [slug, dispatch]);

  useEffect(() => {
    if (formDetail && formDetail.allowed_domains) {
      const currentDomain = window.location.hostname;
      // Cek apakah domain saat ini ada di allowed_domains
      if (!formDetail.allowed_domains.includes(currentDomain)) {
        setIsDomainValid(false);
      }
    }
  }, [formDetail]);

  const handleChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (formDetail) {
      const formattedAnswers = formDetail.questions.map((q) => ({
        question_id: q.id,
        value: answers[q.id] || "",
      }));
      await dispatch(
        submitFormResponse({ slug: formDetail.slug, answers: formattedAnswers })
      );
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!formDetail) return <p>Form not found</p>;

  if (!isDomainValid) {
    return <p>Form tidak dapat diakses dari domain ini.</p>;
  }

  return (
    <div>
      <h2>{formDetail.name}</h2>
      <p>{formDetail.description}</p>
      <form onSubmit={(e) => e.preventDefault()}>
        {formDetail.questions.map((q) => (
          <div key={q.id} style={{ marginBottom: "1rem" }}>
            <label>
              {q.name} {q.is_required === 1 && "*"}
            </label>
            {q.choice_type === "text" && (
              <input
                type="text"
                value={answers[q.id] || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
              />
            )}
            {q.choice_type === "date" && (
              <input
                type="date"
                value={answers[q.id] || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
              />
            )}
            {q.choice_type === "select" && (
              <select
                value={answers[q.id] || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
              >
                <option value="">-- Pilih --</option>
                {q.choices?.split(",").map((choice) => (
                  <option key={choice} value={choice}>
                    {choice}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
        <button type="submit" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Mengirim..." : "Kirim"}
        </button>
      </form>
      {success && <p style={{ color: "green" }}>Berhasil mengirim!</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FormResponse;
