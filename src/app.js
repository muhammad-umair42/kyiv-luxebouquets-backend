import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
const app = express();

//app middlewares and configuration
app.use(cors({ origin: `${process.env.CORS_ORIGIN}`, credentials: true }));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

import categoryRouter from './routes/category.routes.js';
import orderRouter from './routes/order.routes.js';
import productRouter from './routes/product.routes.js';
import userRouter from './routes/user.routes.js';

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/api/v1/users', userRouter);

app.use('/api/v1/products', productRouter);

app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/orders', orderRouter);

export { app };
