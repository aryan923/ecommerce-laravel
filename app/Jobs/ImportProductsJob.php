<?php

namespace App\Jobs;

use App\Services\ProductService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ImportProductsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $productsData;

    public function __construct(array $productsData)
    {
        $this->productsData = $productsData;
    }

    public function handle(ProductService $productService): void
    {
        $productService->processImportBatch($this->productsData);
    }
}
