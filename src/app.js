import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
const app = express();

//app middlewares and configuration
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.route.js";

app.use("/api/v1/users", userRouter);

app.use("/api/v1/products", productRouter);

export { app };
