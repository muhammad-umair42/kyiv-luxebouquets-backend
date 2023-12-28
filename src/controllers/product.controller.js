import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category } = req.body;

  if ([name, description, price, category].some(field => field.trim() === "")) {
    throw new ApiError(404, "All Fields Are Required");
  }

  const productImageLocalFilePath = req.file?.path;

  if (!productImageLocalFilePath) {
    throw new ApiError(400, "Please upload new product image");
  }

  const productImageURL = await uploadOnCloudinary(productImageLocalFilePath);

  if (!productImageURL.url)
    throw new ApiError(500, "Something went wrong uploading Image");

  const product = await Product.create({
    name: name,
    description: description,
    price: price,
    category: category,
    productImage: productImageURL.url,
  });

  res
    .status(201)
    .json(new ApiResponse(201, product, "Product created Successfully"));
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();

  if (!products) {
    throw new ApiError(404, "No Products Found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, products, "Products Fetched Successfully"));
});

export const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product Id is required");
  }
  res
    .status(200)
    .json(new ApiResponse(200, product, "Product Fetched Successfully"));
});

export const updateProductCombinations = asyncHandler(async (req, res) => {
  const combinations = req.body;

  if (!combinations) throw new ApiError(404, "Inputs are required");

  const product = await Product.findByIdAndUpdate(
    req.params?.id,
    { $set: { combinations: { $each: combinations } } },
    { new: true },
  );

  if (!product) {
    throw new ApiError(404, "Something went wrong updating combinations");
  }

  res
    .status(200)
    .json(new ApiResponse(200, product, "Combinations Updated Successfully"));
});

export const updateProductDetails = asyncHandler(async (req, res) => {
  const { name, description, price, category } = req.body;

  if ([name, description, price, category].some(field => field.trim() == "")) {
    throw new ApiError(404, "All Fields Are Required");
  }

  const product = await Product.findByIdAndUpdate(
    req.params?.id,
    {
      $set: {
        name: name,
        description: description,
        price: price,
        category: category,
      },
    },
    { new: true },
  );

  if (!product) {
    throw new ApiError(404, "Something went wrong updating product details");
  }

  res
    .status(200)
    .json(new ApiResponse(200, product, "Prduct updated successfully"));
});

export const updateProductImage = asyncHandler(async (req, res) => {
  const productImageLocalFilePath = req.file?.path;
  const productId = req.params.id;
  if (!productImageLocalFilePath || !productId) {
    throw new ApiError(400, "Please upload new product image and pass id");
  }

  const productImageURL = await uploadOnCloudinary(productImageLocalFilePath);

  if (!productImageURL.url) {
    throw new ApiError(400, "Something went wrong uploading product image");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Something went wrong updating product image");
  }

  const deletePrefiousImage = deleteFromCloudinary(product.productImage);

  if (deletePrefiousImage !== "success") {
    throw new ApiError(404, "Something went wrong deleting previous image");
  }

  const updatedProduct = Product.findByIdAndUpdate(
    productId,
    { $set: { productImage: productImageURL.url } },
    { new: true },
  );

  if (!updatedProduct) {
    throw new ApiError(404, "Something went wrong updating product");
  }

  res.status(200).json(200, { product: updatedProduct }, "Product updated");
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  if (!productId) {
    throw new ApiError(400, "Please pass productId");
  }

  const product = await Product.findByIdAndDelete(productId);

  res.status(200).json(200, {}, "Product deleted successfully");
});
