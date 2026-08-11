<?php

namespace Tests\Feature;

use Tests\TestCase;

class FoundationTest extends TestCase
{
    /**
     * Test health check endpoint returns standard success JSON response.
     */
    public function test_health_check_endpoint_returns_success_payload(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'E-Commerce API is healthy and operational',
                'errors' => null,
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'status',
                    'timestamp',
                    'environment',
                    'framework',
                    'php_version',
                    'version',
                ],
                'errors',
            ]);
    }

    /**
     * Test requesting a non-existent API endpoint returns standard 404 JSON.
     */
    public function test_non_existent_api_route_returns_json_404(): void
    {
        $response = $this->getJson('/api/v1/non-existent-endpoint');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Resource or endpoint not found',
                'data' => null,
                'errors' => null,
            ]);
    }

    /**
     * Test using invalid HTTP method returns 405 Method Not Allowed JSON.
     */
    public function test_invalid_method_returns_json_405(): void
    {
        $response = $this->postJson('/api/v1/health');

        $response->assertStatus(405)
            ->assertJson([
                'success' => false,
                'message' => 'Method not allowed',
                'data' => null,
                'errors' => null,
            ]);
    }

    /**
     * Test unauthenticated access to protected route returns 401 JSON.
     */
    public function test_unauthenticated_request_to_protected_route_returns_json_401(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated',
                'data' => null,
                'errors' => null,
            ]);
    }

    /**
     * Test Swagger API Documentation UI accessibility.
     */
    public function test_swagger_documentation_ui_is_accessible(): void
    {
        $response = $this->get('/api/documentation');

        $response->assertStatus(200);
    }
}
