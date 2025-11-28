import express from "express"
import * as userController from "../controllers/userController.js"
import { validateProfileUpdate,validateAccountDeletion } from "../middleware/validation.js"
import { asyncHandler } from "../middleware/errorHandler.js"

const router = express.Router()

router.get("/profile", asyncHandler(userController.getProfile))

router.put("/profile", validateProfileUpdate, asyncHandler(userController.updateProfile))

router.get("/stats", asyncHandler(userController.getStats))

router.get("/progress", asyncHandler(userController.getProgress))

router.get("/workout-summary", asyncHandler(userController.getWorkoutSummary))

router.delete("/account",validateAccountDeletion, asyncHandler(userController.deleteAccount))

export default router
