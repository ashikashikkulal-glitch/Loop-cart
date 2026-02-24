// src/utils/api.js
// Lightweight API helper for front-end -> backend calls
// Includes: timeouts, unified error handling, exported API_BASE / helpers

// =====================
// Base URLs (no trailing slash)
// =====================
const stripSlash = (u = "") => String(u).replace(/\/+$/, "");
export const API_BASE = stripSlash(import.meta.env.VITE_API_BASE || "http://localhost:5000");
export const PY_API_BASE = stripSlash(import.meta.env.VITE_PY_API_BASE || "http://127.0.0.1:8000");

// Optional: force which backend to use for search ("python" | "node")
const SEARCH_BACKEND = (import.meta.env.VITE_SEARCH_BACKEND || "").toLowerCase();

// =====================
// Auth token helpers
// =====================
const AUTH_KEY = "authToken";

export function setAuthToken(token) {
  localStorage.setItem(AUTH_KEY, token);
}
export function getAuthToken() {
  return localStorage.getItem(AUTH_KEY) || "";
}
export function clearAuthToken() {
  localStorage.removeItem(AUTH_KEY);
}

// Build default headers with token when available
function authHeaders(extra = {}) {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// =====================
// Small fetch helpers (timeout + safe JSON + unified errors)
// =====================
const DEFAULT_TIMEOUT_MS = 10000; // 10s

async function withTimeout(promiseFactory, ms = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await promiseFactory(controller.signal);
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    // Normalize abort error
    if (e && e.name === "AbortError") throw new Error(`Request timed out after ${ms}ms`);
    throw e;
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function request(url, options = {}, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  return withTimeout(
    async (signal) => {
      const res = await fetch(url, { ...options, signal });
      const data = await safeJson(res);
      if (!res.ok) {
        const msg = data?.message || data?.detail || data?.error || res.statusText || "Request failed";
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    },
    timeoutMs
  );
}

// =====================
// Basic verbs
// =====================
export async function post(path, body, opts = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  return request(
    url,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body ?? {}),
    },
    opts
  );
}

export async function get(path, opts = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  return request(url, { headers: authHeaders() }, opts);
}

export async function getPython(path, opts = {}) {
  const url = `${PY_API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  return request(url, { headers: { "Content-Type": "application/json" } }, opts);
}

// =====================
// Product helpers
// =====================

// Helper: decide if a product object looks "complete" for the UI
function looksLikeFullProduct(p) {
  if (!p || typeof p !== "object") return false;
  // require at least one of these fields to consider it "full"
  if (Array.isArray(p.images) && p.images.length) return true;
  if (p.specs && Object.keys(p.specs).length) return true;
  if (p.details || p.description) return true;
  if (p.store && Object.keys(p.store).length) return true;
  return false;
}

/**
 * Try to fetch products from backend API first; if that fails or returns nothing,
 * fall back to the static frontend product.json (served at /product.json).
 */
export async function fetchProducts() {
  // try node/api first
  try {
    const data = await get(`/api/products`);
    if (Array.isArray(data) && data.length) return data;
    // if response is an object with items
    if (Array.isArray(data?.items) && data.items.length) return data.items;
  } catch (e) {
    // ignore and fallback
    // console.warn("fetchProducts: backend failed, falling back to /product.json", e);
  }

  // Fallback: load product.json from frontend public folder
  try {
    const res = await fetch("/product.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Frontend product.json not found");
    const json = await res.json();
    if (Array.isArray(json)) return json;
    return Array.isArray(json?.items) ? json.items : [];
  } catch (e) {
    // final fallback: return empty array
    console.error("fetchProducts fallback failed:", e);
    return [];
  }
}

/**
 * Fetch single product by id:
 * - first try backend GET /api/products/:id
 * - if backend returns something small/incomplete, use frontend product.json to find the product
 */
export async function fetchProductById(id) {
  if (!id) throw new Error("Missing product id");
  const encoded = encodeURIComponent(String(id));
  const urlPath = `/api/products/${encoded}`;

  // Try backend API
  try {
    const data = await get(urlPath);
    if (looksLikeFullProduct(data)) return data;
    // if data is empty / partial, fall through to static product.json
  } catch (e) {
    // backend failed — we'll try frontend product.json
    // console.warn("fetchProductById backend failed, will try frontend product.json", e);
  }

  // Fallback: find inside frontend product.json
  try {
    const list = await fetchProducts(); // fetchProducts includes /product.json fallback
    const found = list.find((it) => String(it?.id) === String(id) || String(it?._id) === String(id));
    if (found) return found;
    throw new Error("Product not found in frontend product.json");
  } catch (e) {
    throw new Error(e.message || "Product not found");
  }
}

// =====================
// Search helpers (node / python) - return guaranteed array
// =====================
export async function searchProductsNode(query) {
  const q = (query || "").trim();
  const data = await get(`/api/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export async function searchProductsPython(query) {
  const q = (query || "").trim();
  const data = await getPython(`/search${q ? `?query=${encodeURIComponent(q)}` : ""}`);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

// Unified search with simple in-memory cache (1 minute)
const searchCache = new Map();
const CACHE_TTL_MS = 60_000;

function getCached(backend, query) {
  const key = `${backend}|${String(query || "").toLowerCase()}`;
  const hit = searchCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.t > CACHE_TTL_MS) {
    searchCache.delete(key);
    return null;
  }
  return hit.v;
}
function setCached(backend, query, value) {
  const key = `${backend}|${String(query || "").toLowerCase()}`;
  searchCache.set(key, { t: Date.now(), v: value });
}

export async function searchProducts(query) {
  const q = (query || "").trim();
  if (!q) return [];

  // explicit backend override
  if (SEARCH_BACKEND === "python") {
    const cached = getCached("python", q);
    if (cached) return cached;
    const list = await searchProductsPython(q);
    setCached("python", q, list);
    return list;
  }

  if (SEARCH_BACKEND === "node") {
    const cached = getCached("node", q);
    if (cached) return cached;
    const list = await searchProductsNode(q);
    setCached("node", q, list);
    return list;
  }

  // auto detect: try python then fallback
  const cachedPy = getCached("python", q);
  if (cachedPy) return cachedPy;

  try {
    const pyList = await searchProductsPython(q);
    setCached("python", q, pyList);
    return pyList;
  } catch (e) {
    const cachedNode = getCached("node", q);
    if (cachedNode) return cachedNode;
    const nodeList = await searchProductsNode(q);
    setCached("node", q, nodeList);
    return nodeList;
  }
}

// =====================
// Health checks
// =====================
export async function pingNode() {
  try {
    return await get(`/api/health`);
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
export async function pingPython() {
  try {
    return await getPython(`/health`);
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// =====================
// Utility: normalize image path into absolute URL
//  - if path is already absolute (http/https), return as-is
//  - if path is root-relative (starts with '/'), return as-is (frontend public)
//  - if path starts with 'images' (no leading slash) prefer frontend public `/images/...`
//  - otherwise fallback to API_BASE + path
// =====================
export function imageUrl(src) {
  if (!src) return "/images/placeholder.jpg";
  const s = String(src).trim();
  if (!s) return "/images/placeholder.jpg";
  if (/^https?:\/\//i.test(s)) return s;
  // If the path already contains the API_BASE, return as-is
  if (s.startsWith(API_BASE)) return s;
  // prefer frontend public paths when given absolute root or images/ path
  if (s.startsWith("/")) return s;
  if (/^images[\/\\]/i.test(s)) return "/" + s.replace(/^\/+/, "");
  // otherwise assume backend-hosted file
  const pathPart = s.startsWith("/") ? s : `/${s}`;
  return `${API_BASE}${pathPart}`;
}