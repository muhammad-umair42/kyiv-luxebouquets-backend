import { Category } from "../models/category.model.js";
import { asyncHandler } from "./../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(404, "Category Name is required");
  }

  const categoryImagePath = req.file?.path;

  if (!categoryImagePath) {
    throw new ApiError(404, "Category Image is required");
  }

  const categoryImageUrl = await uploadOnCloudinary(categoryImagePath);

  if (!categoryImageUrl.url) {
    throw new ApiError(
      404,
      "Something went wrong while uploading category image",
    );
  }

  const category = await Category.create({
    name,
    categoryImage: categoryImageUrl.url,
  });

  if (!category) {
    throw new ApiError(404, "Something went wrong while creating category");
  }

  res
    .status(201)
    .json(new ApiResponse(201, category, "Category Created Successfully"));
});

export const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  if (!categories) {
    throw new ApiError(404, "Something went wrong while fetching categories");
  }

  res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

export const getSingleCategoryProducts = asyncHandler(async (req, res) => {
  const category = req.params?.id;

  if (!category) {
    throw new ApiError(404, "Category Id is required");
  }
  const categoryProductIds = await Category.findById(category).select(
    "categoryProducts",
  );

  if (!categoryProductIds) {
    throw new ApiError(
      404,
      "Something went wrong while fetching category products",
    );
  }
  console.log(categoryProductIds);
  const categoryProducts = await Product.find({
    _id: { $in: categoryProductIds.categoryProducts },
  }).select("name price");

  if (!categoryProducts) {
    throw new ApiError(
      404,
      "Something went wrong while fetching category products",
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { categoryProducts: categoryProducts },
        "Products fetched successfully",
      ),
    );
});

export const updateCategoryProduct = asyncHandler(async (req, res) => {
  const { products } = req.body;
  const category = req.params.id;

  if (!products || !category) {
    throw new ApiError(404, "All files are required");
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    category,
    { $set: { categoryProducts: products } },
    { new: true },
  );

  if (!updatedCategory) {
    throw new ApiError(404, "Something went wrong while updating category");
  }

  res.status(200).json(new ApiResponse(200, updatedCategory, "Success"));
});

export const updateCategoryImage = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const categoryImagePath = req.file?.path;

  if (!categoryImagePath || !categoryId) {
    throw new ApiError(404, "Category Image is required");
  }

  const categoryImageUrl = await uploadOnCloudinary(categoryImagePath);

  if (!categoryImageUrl.url) {
    throw new ApiError(
      404,
      "Something went wrong while uploading category image",
    );
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Something went wrong while updating category");
  }

  const previouscategoryImageUrl = category.categoryImage;

  const deleteCloudinary = await deleteFromCloudinary(previouscategoryImageUrl);

  if (deleteCloudinary === "error") {
    throw new ApiError(
      404,
      "Something went wrong while deleting previous image",
    );
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    { $set: { categoryImage: categoryImageUrl.url } },
    { new: true },
  );

  res
    .status(200)
    .json(new ApiResponse(200, updatedCategory, "Image Updated Successfully."));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;

  await Category.findByIdAndDelete(categoryId);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Category deleted successfully"));
});
