import express from "express";
import { getDashboardStats, getAllTours,
    deleteTours, updateTours, getSingleTours, addTour, getAllMessages, deleteMessage, getAllUsers, deleteUser, getStats
 } from "../controllers/adminControllers.js";
import { authMiddleware, verifyAdmin } from "../middleware/authMiddleware.js";

const routes = express.Router();

routes.get("/stats", authMiddleware, verifyAdmin, getDashboardStats);
routes.get("/tours", authMiddleware, verifyAdmin, getAllTours)
routes.delete("/tours/:id", authMiddleware, verifyAdmin, deleteTours)
routes.get("/tours/:id", authMiddleware, verifyAdmin, getSingleTours)
routes.put("/tours/:id", authMiddleware, verifyAdmin, updateTours)
routes.post("/add", authMiddleware, verifyAdmin, addTour)
routes.get("/messages", authMiddleware, verifyAdmin, getAllMessages);
routes.delete("/messages/:id", authMiddleware, verifyAdmin, deleteMessage);
routes.get("/users", authMiddleware, verifyAdmin, getAllUsers);
routes.delete("/users/:id", authMiddleware, verifyAdmin, deleteUser);
routes.get("/statstwo", authMiddleware, verifyAdmin, getStats)

export default routes;