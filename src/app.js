import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import path, { dirname } from 'path';

import { fileURLToPath } from 'url';
const app = express();
const origin = req.protocol + '://' + req.get('host');
//app middlewares and configuration
app.use(cors({ origin: origin, credentials: true }));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.get('/', (req, res) => {
  app.use(express.static(path.resolve(__dirname, 'client', 'dist')));
  res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
});

import categoryRouter from './routes/category.routes.js';
import orderRouter from './routes/order.routes.js';
import productRouter from './routes/product.routes.js';
import userRouter from './routes/user.routes.js';
app.use('/api/v1/users', userRouter);

app.use('/api/v1/products', productRouter);

app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/orders', orderRouter);

export { app };
