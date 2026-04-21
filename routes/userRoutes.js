import { Register, Login, googleSync, VerifyEmail,
    ForgotPassword, ResetPassword
 } from "../controllers/userControllers.js";
import express from "express"

const routes = express.Router()

routes.post("/register", Register)
routes.post("/login", Login)
routes.post("/google-sync", googleSync)
routes.post('/verify', VerifyEmail)
routes.post("/forgot-password", ForgotPassword)
routes.post("/reset-password", ResetPassword)

export default routes
