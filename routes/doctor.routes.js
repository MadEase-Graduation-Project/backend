import express from "express";
import authenticateJWT from "../middlewares/auth.js";
import {
	destroy,
	show,
	store,
	update,
} from "../controllers/doctor.controller.js";
const router = express.Router();

router.get("/", authenticateJWT, show);

router.post("/", store);

router.put("/:id", authenticateJWT, update);

router.delete("/:id", authenticateJWT, destroy);

export default router;
