import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import dotenv from "dotenv"
import connectDatabase from "./config/database.js"


dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || "development"

connectDatabase()

app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials:true,
}))

app.use(express.json({limit:"10mb"}))
app.use(express.urlencoded({extended:true, limit:"10mb"}))

app.use(compression())

if (NODE_ENV === "development"){
    app.use(morgan("dev"))
}

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  })
})


app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  })
})


app.listen(PORT, () => {
  console.log(`Shukuma Server running on port ${PORT}`)
})