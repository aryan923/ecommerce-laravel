<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class ProductController extends BaseController
{
    public function __construct(
        protected ProductService $productService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/admin/products",
     *     summary="List Products (Admin)",
     *     description="Retrieve paginated list of products with search, status, type, brand, category, and price range filters.",
     *     operationId="adminListProducts",
     *     tags={"Admin Product Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="type", in="query", required=false, @OA\Schema(type="string", enum={"simple","variable","digital"})),
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"draft","active","inactive","archived"})),
     *     @OA\Parameter(name="brand_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="category_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="featured", in="query", required=false, @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="min_price", in="query", required=false, @OA\Schema(type="number")),
     *     @OA\Parameter(name="max_price", in="query", required=false, @OA\Schema(type="number")),
     *     @OA\Parameter(name="sort_by", in="query", required=false, @OA\Schema(type="string", enum={"latest","oldest","price_low_high","price_high_low","name_asc"})),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Products retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'type', 'status', 'brand_id', 'category_id', 'featured', 'min_price', 'max_price', 'sort_by']);
        $perPage = (int) $request->input('per_page', 15);

        $products = $this->productService->list($filters, $perPage);

        return $this->paginatedResponse($products, 'Products retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/products",
     *     summary="Create Product",
     *     description="Create a new simple, variable, or digital product.",
     *     operationId="adminCreateProduct",
     *     tags={"Admin Product Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","type","price","category_ids"},
     *             @OA\Property(property="name", type="string", example="Wireless Noise Cancelling Headphones"),
     *             @OA\Property(property="type", type="string", enum={"simple","variable","digital"}, example="simple"),
     *             @OA\Property(property="status", type="string", enum={"draft","active","inactive","archived"}, example="active"),
     *             @OA\Property(property="brand_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="category_ids", type="array", @OA\Items(type="integer", example=1)),
     *             @OA\Property(property="primary_category_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="price", type="number", example=199.99),
     *             @OA\Property(property="sale_price", type="number", nullable=true, example=149.99),
     *             @OA\Property(property="tax_class", type="array", @OA\Items(type="string", example="standard"), nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Product created successfully")
     * )
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productService->create($request->validated());

        return $this->successResponse($product, 'Product created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/products/{id}",
     *     summary="View Product Details",
     *     description="Retrieve details of a single product with brand and category relations.",
     *     operationId="adminShowProduct",
     *     tags={"Admin Product Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Product details retrieved successfully")
     * )
     */
    public function show(Product $product): JsonResponse
    {
        return $this->successResponse($product->load(['brand', 'categories']), 'Product details retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/products/{id}",
     *     summary="Update Product",
     *     description="Update product properties and category attachments.",
     *     operationId="adminUpdateProduct",
     *     tags={"Admin Product Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Wireless Noise Cancelling Headphones Pro"),
     *             @OA\Property(property="price", type="number", example=219.99)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Product updated successfully")
     * )
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $updatedProduct = $this->productService->update($product, $request->validated());

        return $this->successResponse($updatedProduct, 'Product updated successfully.');
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/products/{id}/status",
     *     summary="Toggle Product Status",
     *     description="Toggle product status to draft, active, inactive, or archived.",
     *     operationId="adminToggleProductStatus",
     *     tags={"Admin Product Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"draft","active","inactive","archived"}, example="active")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Product status updated successfully")
     * )
     */
    public function toggleStatus(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:draft,active,inactive,archived'],
        ]);

        $updatedProduct = $this->productService->toggleStatus($product, $request->input('status'));

        return $this->successResponse($updatedProduct, 'Product status updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/products/{id}",
     *     summary="Delete Product",
     *     description="Delete a product record.",
     *     operationId="adminDeleteProduct",
     *     tags={"Admin Product Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Product deleted successfully")
     * )
     */
    public function destroy(Product $product): JsonResponse
    {
        $this->productService->delete($product);

        return $this->successResponse(null, 'Product deleted successfully.');
    }
}
