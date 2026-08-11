<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\GenerateVariantMatrixRequest;
use App\Http\Requests\Admin\StoreVariantRequest;
use App\Http\Requests\Admin\UpdateVariantRequest;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\VariantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class VariantController extends BaseController
{
    public function __construct(
        protected VariantService $variantService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/admin/products/{product_id}/variants",
     *     summary="List Product Variants",
     *     description="Retrieve all variants belonging to a specific product with assigned attribute values.",
     *     operationId="adminListProductVariants",
     *     tags={"Admin Product Variants"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="product_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Product variants retrieved successfully")
     * )
     */
    public function index(Product $product): JsonResponse
    {
        $variants = $this->variantService->list($product);

        return $this->successResponse($variants, 'Product variants retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/products/{product_id}/variants/generate",
     *     summary="Generate Variant Matrix",
     *     description="Generate Cartesian product variant matrix from selected attribute value arrays.",
     *     operationId="adminGenerateVariantMatrix",
     *     tags={"Admin Product Variants"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="product_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"attribute_value_ids"},
     *             @OA\Property(
     *                 property="attribute_value_ids",
     *                 type="array",
     *                 @OA\Items(type="array", @OA\Items(type="integer", example=1))
     *             ),
     *             @OA\Property(property="base_price", type="number", example=49.99),
     *             @OA\Property(property="base_stock", type="integer", example=10)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Variant matrix generated successfully")
     * )
     */
    public function generate(GenerateVariantMatrixRequest $request, Product $product): JsonResponse
    {
        $result = $this->variantService->generateMatrix(
            $product,
            $request->input('attribute_value_ids'),
            $request->input('base_price'),
            $request->input('base_stock', 0)
        );

        return $this->successResponse($result, "Generated {$result['created_count']} new variants (skipped {$result['skipped_count']} existing).", 201);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/products/{product_id}/variants",
     *     summary="Create Single Variant",
     *     description="Manually create a single product variant.",
     *     operationId="adminCreateProductVariant",
     *     tags={"Admin Product Variants"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="product_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"price"},
     *             @OA\Property(property="sku", type="string", example="VAR-RED-XL"),
     *             @OA\Property(property="barcode", type="string", example="1234567890123"),
     *             @OA\Property(property="price", type="number", example=59.99),
     *             @OA\Property(property="sale_price", type="number", nullable=true, example=49.99),
     *             @OA\Property(property="stock_qty", type="integer", example=15),
     *             @OA\Property(property="attribute_value_ids", type="array", @OA\Items(type="integer", example=1))
     *         )
     *     ),
     *     @OA\Response(response=201, description="Product variant created successfully")
     * )
     */
    public function store(StoreVariantRequest $request, Product $product): JsonResponse
    {
        $variant = $this->variantService->create($product, $request->validated());

        return $this->successResponse($variant, 'Product variant created successfully.', 201);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/variants/{id}",
     *     summary="Update Product Variant",
     *     description="Update properties, price, stock, and attribute values of a variant.",
     *     operationId="adminUpdateProductVariant",
     *     tags={"Admin Product Variants"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="price", type="number", example=64.99),
     *             @OA\Property(property="stock_qty", type="integer", example=20)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Product variant updated successfully")
     * )
     */
    public function update(UpdateVariantRequest $request, ProductVariant $variant): JsonResponse
    {
        $updatedVariant = $this->variantService->update($variant, $request->validated());

        return $this->successResponse($updatedVariant, 'Product variant updated successfully.');
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/variants/{id}/status",
     *     summary="Toggle Variant Status",
     *     description="Toggle variant status to active or inactive.",
     *     operationId="adminToggleVariantStatus",
     *     tags={"Admin Product Variants"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"active","inactive"}, example="inactive")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Product variant status updated successfully")
     * )
     */
    public function toggleStatus(Request $request, ProductVariant $variant): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:active,inactive'],
        ]);

        $updatedVariant = $this->variantService->toggleStatus($variant, $request->input('status'));

        return $this->successResponse($updatedVariant, 'Product variant status updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/variants/{id}",
     *     summary="Delete Product Variant",
     *     description="Delete a product variant record.",
     *     operationId="adminDeleteProductVariant",
     *     tags={"Admin Product Variants"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Product variant deleted successfully")
     * )
     */
    public function destroy(ProductVariant $variant): JsonResponse
    {
        $this->variantService->delete($variant);

        return $this->successResponse(null, 'Product variant deleted successfully.');
    }
}
