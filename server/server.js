import express from "express"
import "dotenv/config.js";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";



connectDB()

const app = express()
app.use(cors())

// middleware
app.use(express.json())
app.use(clerkMiddleware())

//api to listen to clerk webhooks
app.use('/api/clerk', clerkWebhooks)

app.get('/', (req, res)=> res.send("API IS WORKING"))

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));