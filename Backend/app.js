import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./Routes/userRouter.js";
import blogRouter from "./Routes/blogRouter.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

app.use("/api/users", userRouter);
app.use("/api/blog", blogRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
