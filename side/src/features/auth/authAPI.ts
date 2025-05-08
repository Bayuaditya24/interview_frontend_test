export const loginAPI = async (email: string, password: string) => {
  const response = await fetch("http://localhost:3001/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Login failed");
  }

  const result = await response.json(); // expected: { token }

  // Simpan token di localStorage
  if (result.token) {
    localStorage.setItem("accessToken", result.token); // Simpan token dengan nama 'accessToken'
  }

  return result; // Anda bisa return hasil login jika perlu
};
