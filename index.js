import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./Routes/UserRoutes.js";
import resumeRoutes from "./Routes/ResumeRoutes.js";
import db from "./Config/Database.js";
import coverLetterRoutes from './Routes/CoverLetterRoutes.js';


dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'exp://192.168.*.*:8081'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);

app.use("/api/cover-letters", coverLetterRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    database: 'Connected', 
    timestamp: new Date() 
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000; // R
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`); // 
});