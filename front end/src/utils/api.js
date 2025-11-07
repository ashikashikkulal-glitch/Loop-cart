// src/utils/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data;
}

export function setAuthToken(token) {
  localStorage.setItem("authToken", token);
}
