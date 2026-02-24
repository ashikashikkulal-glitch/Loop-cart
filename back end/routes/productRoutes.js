import express from "express";
import * as pc from "../controllers/productController.js";

const router = express.Router();

router.get("/products", pc.getAll);
router.get("/search", pc.search);

export default router;
