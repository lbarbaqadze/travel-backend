import express from 'express'
import { sendContactMessage } from '../controllers/contactControllers.js'

const routes = express.Router()

routes.post("/send-message", sendContactMessage)

export default routes