import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { Order } from './../models/order.model.js';
import { ApiResponse } from './../utils/ApiResponse.js';
import { asyncHandler } from './../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { user, products, total, shippingAddress, payment } = req.body;
  console.log(req.body);

  if (!user || !products || !total || !shippingAddress || !payment) {
    res.status(400);
    throw new ApiError('All fields are required');
  }
  const productsWithObjectIds = products.map(product => ({
    id: new mongoose.Types.ObjectId(product.id), // Assuming product.id is a string
    quantity: product.quantity,
  }));
  const newOrder = await Order.create({
    user,
    products: productsWithObjectIds,
    total,
    shippingAddress,
    payment,
  });

  await newOrder.save();

  if (!newOrder) {
    res.status(500);
    throw new ApiError('Something went wrong');
  }
  res
    .status(201)
    .json(new ApiResponse('Order created successfully', { order: newOrder }));
});

export const getOrder = asyncHandler(async (req, res) => {
  const id = req?.user?.id;

  if (!id) {
    res.status(400);
    throw new ApiError('User id is required');
  }

  const orders = await Order.find({ user: id }).populate(
    'products.id',
    'name price',
  );
  if (!orders) {
    res.status(500);
    throw new ApiError('Something went wrong');
  }

  res.status(200).json(new ApiResponse('Orders fetched', { orders }));
});
