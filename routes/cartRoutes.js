import express from "express"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { addToCart, getCart, removeCart } from "../controllers/cartControllers.js"

const routes = express.Router()

routes.post("/", authMiddleware, addToCart)
routes.get("/", authMiddleware, getCart)
routes.delete("/:id", authMiddleware, removeCart)

export default routes