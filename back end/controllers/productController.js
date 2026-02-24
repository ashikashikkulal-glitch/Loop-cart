// back end/controllers/productController.js (ESM)
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let CACHE = null;

async function readProducts() {
  if (CACHE) return CACHE;
  const file = path.join(__dirname, "..", "product.json");
  const raw = await fs.readFile(file, "utf-8");
  CACHE = JSON.parse(raw);
  return CACHE;
}

// GET /api/products
export async function getAll(req, res) {
  try {
    const data = await readProducts();
    res.json(data);
  } catch (err) {
    console.error("getAll error:", err);
    res.status(500).json({ message: "Could not load products" });
  }
}

// GET /api/search?q=...
export async function search(req, res) {
  try {
    const q = (req.query.q || "").toString().toLowerCase().trim();
    const data = await readProducts();
    if (!q) return res.json(data);

    const results = data.filter((p) => {
      const hay = [
        p.title,
        p.brand,
        p.category,
        ...(p.tags || []),
        JSON.stringify(p.specs || {}),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    res.json(results);
  } catch (err) {
    console.error("search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
}
