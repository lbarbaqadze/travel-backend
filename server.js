import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes.js"
import toursRoutes from "./routes/toursRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import contactRoutes from "./routes/contactRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"

dotenv.config()
const server = express()
server.use(express.json())
server.use(cors())

server.use("/api/users", userRoutes)
server.use("/api/tours", toursRoutes)
server.use("/api/cart", cartRoutes)
server.use("/api/contact", contactRoutes)
server.use("/api/admin", adminRoutes)
server.use("/api/bookings", bookingRoutes)

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
