import { Category } from '../models/category.model.js';
import { Product } from '../models/product.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from '../utils/cloudinary.js';
import { asyncHandler } from './../utils/asyncHandler.js';

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(404, 'Category Name is required');
  }

  const categoryImagePath = req.file?.path;

  if (!categoryImagePath) {
    throw new ApiError(404, 'Category Image is required');
  }

  const categoryImageUrl = await uploadOnCloudinary(categoryImagePath);

  if (!categoryImageUrl.url) {
    throw new ApiError(
      404,
      'Something went wrong while uploading category image',
    );
  }

  const category = await Category.create({
    name,
    categoryImage: categoryImageUrl.url,
  });

  if (!category) {
    throw new ApiError(404, 'Something went wrong while creating category');
  }

  res
    .status(201)
    .json(new ApiResponse(201, category, 'Category Created Successfully'));
});

export const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  if (!categories) {
    throw new ApiError(404, 'Something went wrong while fetching categories');
  }

  res
    .status(200)
    .json(new ApiResponse(200, categories, 'Categories fetched successfully'));
});

export const getSingleCategoryProducts = asyncHandler(async (req, res) => {
  const category = req.params?.id;

  if (!category) {
    throw new ApiError(404, 'Category Id is required');
  }
  const categoryInfo = await Category.findById(category)
    .populate({
      path: 'categoryProducts',
      select: 'name price productImage',
    })
    .select('name categoryImage');

  if (!categoryInfo) {
    throw new ApiError(
      404,
      'Something went wrong while fetching category products',
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { category: categoryInfo },
        'Products fetched successfully',
      ),
    );
});

export const updateCategoryProduct = asyncHandler(async (req, res) => {
  const products = req.body;
  const category = req.params.id;

  if (!products || !category) {
    throw new ApiError(404, 'All files are required');
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    category,
    { $set: { categoryProducts: products } },
    { new: true },
  );

  if (!updatedCategory) {
    throw new ApiError(404, 'Something went wrong while updating category');
  }

  res.status(200).json(new ApiResponse(200, updatedCategory, 'Success'));
});

export const updateCategoryImage = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const categoryImagePath = req.file?.path;

  if (!categoryImagePath || !categoryId) {
    throw new ApiError(404, 'Category Image is required');
  }

  const categoryImageUrl = await uploadOnCloudinary(categoryImagePath);

  if (!categoryImageUrl.url) {
    throw new ApiError(
      404,
      'Something went wrong while uploading category image',
    );
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, 'Something went wrong while updating category');
  }

  const previouscategoryImageUrl = category.categoryImage;

  const deleteCloudinary = await deleteFromCloudinary(previouscategoryImageUrl);

  if (deleteCloudinary === 'error') {
    throw new ApiError(
      404,
      'Something went wrong while deleting previous image',
    );
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    { $set: { categoryImage: categoryImageUrl.url } },
    { new: true },
  );

  res
    .status(200)
    .json(new ApiResponse(200, updatedCategory, 'Image Updated Successfully.'));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;

  await Category.findByIdAndDelete(categoryId);

  res
    .status(200)
    .json(new ApiResponse(200, {}, 'Category deleted successfully'));
});

export const getSimilarCategoryProducts = asyncHandler(async (req, res) => {
  //sending product id and populating category products
  const productId = req.params.id;

  if (!productId) {
    throw new ApiError(404, 'Product Id is required');
  }

  const similarProducts = await Category.findOne({
    categoryProducts: productId,
  })
    .populate({
      path: 'categoryProducts',
      select: 'name price productImage',
      options: { limit: 4 },
    })
    .select('categoryProducts');
  if (!similarProducts) {
    throw new ApiError(
      404,
      'Something went wrong while fetching similar products',
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { similarProducts: similarProducts.categoryProducts },
        'Similar Products Fetched Successfully',
      ),
    );
});
