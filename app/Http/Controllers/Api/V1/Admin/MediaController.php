<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\AttachMediaRequest;
use App\Http\Requests\Admin\SortMediaRequest;
use App\Http\Requests\Admin\UpdateMediaRequest;
use App\Http\Requests\Admin\UploadMediaRequest;
use App\Models\Media;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class MediaController extends BaseController
{
    public function __construct(
        protected MediaService $mediaService
    ) {}

    /**
     * @OA\Post(
     *     path="/api/v1/admin/media/upload",
     *     summary="Upload Media Files (Admin)",
     *     description="Upload single or multiple image/document files to storage and persist media records.",
     *     operationId="adminUploadMedia",
     *     tags={"Admin Media Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="file", type="string", format="binary", description="Single file to upload"),
     *                 @OA\Property(property="files", type="array", @OA\Items(type="string", format="binary"), description="Array of files for batch upload"),
     *                 @OA\Property(property="model_type", type="string", enum={"product","category","brand","banner","cms_page"}),
     *                 @OA\Property(property="model_id", type="integer"),
     *                 @OA\Property(property="type", type="string", enum={"main","gallery","thumbnail","banner","document"}),
     *                 @OA\Property(property="alt", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Media uploaded successfully"),
     *     @OA\Response(response=422, description="Validation failure")
     * )
     */
    public function upload(UploadMediaRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('files')) {
            $mediaList = $this->mediaService->uploadMultiple($request->file('files'), $validated);
            return $this->successResponse($mediaList, 'Media batch uploaded successfully.', 201);
        }

        $media = $this->mediaService->upload($request->file('file'), $validated);
        return $this->successResponse($media, 'Media file uploaded successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/media",
     *     summary="List Media Assets (Admin)",
     *     description="Retrieve paginated list of media records with search and filter parameters.",
     *     operationId="adminListMedia",
     *     tags={"Admin Media Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="type", in="query", required=false, @OA\Schema(type="string", enum={"main","gallery","thumbnail","banner","document"})),
     *     @OA\Parameter(name="mime_type", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="model_type", in="query", required=false, @OA\Schema(type="string", enum={"product","category","brand","banner","cms_page"})),
     *     @OA\Parameter(name="model_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="unattached_only", in="query", required=false, @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Media records retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'type', 'mime_type', 'model_type', 'model_id', 'unattached_only']);
        $perPage = (int) $request->input('per_page', 15);

        $mediaList = $this->mediaService->list($filters, $perPage);

        return $this->paginatedResponse($mediaList, 'Media library records retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/media/{id}",
     *     summary="Get Media Detail (Admin)",
     *     description="Fetch details of a single media asset by ID.",
     *     operationId="adminGetMediaDetail",
     *     tags={"Admin Media Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Media detail retrieved successfully"),
     *     @OA\Response(response=404, description="Media not found")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $media = Media::findOrFail($id);
        return $this->successResponse($media, 'Media detail retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/media/attach",
     *     summary="Attach Media to Entity (Admin)",
     *     description="Attach an existing media asset to a Product, Category, Brand, or Banner.",
     *     operationId="adminAttachMedia",
     *     tags={"Admin Media Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"media_id","model_type","model_id"},
     *             @OA\Property(property="media_id", type="integer"),
     *             @OA\Property(property="model_type", type="string", enum={"product","category","brand","banner","cms_page"}),
     *             @OA\Property(property="model_id", type="integer"),
     *             @OA\Property(property="type", type="string", enum={"main","gallery","thumbnail","banner","document"}),
     *             @OA\Property(property="alt", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Media attached successfully"),
     *     @OA\Response(response=422, description="Validation failure")
     * )
     */
    public function attach(AttachMediaRequest $request): JsonResponse
    {
        try {
            $media = $this->mediaService->attach(
                (int) $request->input('media_id'),
                $request->input('model_type'),
                (int) $request->input('model_id'),
                $request->input('type'),
                $request->input('alt')
            );

            return $this->successResponse($media, 'Media attached to entity successfully.');
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500, ['exception' => get_class($e), 'trace' => $e->getTraceAsString()]);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/media/detach",
     *     summary="Detach Media from Entity (Admin)",
     *     description="Detach a media asset from its associated entity.",
     *     operationId="adminDetachMedia",
     *     tags={"Admin Media Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"media_id"},
     *             @OA\Property(property="media_id", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Media detached successfully")
     * )
     */
    public function detach(Request $request): JsonResponse
    {
        $request->validate(['media_id' => 'required|exists:media,id']);
        $media = $this->mediaService->detach((int) $request->input('media_id'));

        return $this->successResponse($media, 'Media detached successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/media/{id}",
     *     summary="Update Media Metadata (Admin)",
     *     description="Update alt text, asset type, or sort order for a media item.",
     *     operationId="adminUpdateMedia",
     *     tags={"Admin Media Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="alt", type="string"),
     *             @OA\Property(property="type", type="string", enum={"main","gallery","thumbnail","banner","document"}),
     *             @OA\Property(property="sort_order", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Media metadata updated successfully")
     * )
     */
    public function update(int $id, UpdateMediaRequest $request): JsonResponse
    {
        $media = Media::findOrFail($id);
        $updated = $this->mediaService->updateMetadata($media, $request->validated());

        return $this->successResponse($updated, 'Media metadata updated successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/media/sort",
     *     summary="Bulk Sort Media Items (Admin)",
     *     description="Update sort_order index for multiple gallery media items.",
     *     operationId="adminSortMedia",
     *     tags={"Admin Media Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"items"},
     *             @OA\Property(
     *                 property="items",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="sort_order", type="integer")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Media items reordered successfully")
     * )
     */
    public function sort(SortMediaRequest $request): JsonResponse
    {
        $this->mediaService->sort($request->input('items'));
        return $this->successResponse(null, 'Media items reordered successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/media/{id}",
     *     summary="Delete Media Asset (Admin)",
     *     description="Delete media record and remove physical file from storage disk.",
     *     operationId="adminDeleteMedia",
     *     tags={"Admin Media Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="force", in="query", required=false, @OA\Schema(type="boolean")),
     *     @OA\Response(response=200, description="Media deleted successfully"),
     *     @OA\Response(response=422, description="Safety check failed (media is attached)")
     * )
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $media = Media::findOrFail($id);
        $force = (bool) $request->boolean('force', false);

        $this->mediaService->delete($media, $force);

        return $this->successResponse(null, 'Media deleted successfully and removed from storage disk.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/media/unused",
     *     summary="Purge Unattached Media (Admin)",
     *     description="Purge orphaned unattached media records and remove files from storage.",
     *     operationId="adminPurgeUnusedMedia",
     *     tags={"Admin Media Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="older_than_days", in="query", required=false, @OA\Schema(type="integer", default=1)),
     *     @OA\Response(response=200, description="Unused media purged successfully")
     * )
     */
    public function purgeUnused(Request $request): JsonResponse
    {
        $days = (int) $request->input('older_than_days', 1);
        $purgedCount = $this->mediaService->purgeUnused($days);

        return $this->successResponse(['purged_count' => $purgedCount], "{$purgedCount} unused media records purged successfully.");
    }
}
