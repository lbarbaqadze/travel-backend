import express from "express"
import { getTours, getEuropeTours, getAsiaTours, getSingleTours } from "../controllers/toursControllers.js"

const routes = express.Router()

routes.get("/", getTours)
routes.get("/europe", getEuropeTours)
routes.get("/asia", getAsiaTours)
routes.get("/:id", getSingleTours)


export default routes;