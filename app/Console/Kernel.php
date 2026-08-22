<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // 1. Expire stale cart reservations every 15 minutes
        $schedule->call(function () {
            \App\Models\Cart::where('updated_at', '<', now()->subMinutes(15))->delete();
        })->everyFifteenMinutes()->name('cart:expire');

        // 2. Expire outdated coupons daily at midnight
        $schedule->call(function () {
            \App\Models\Coupon::where('end_date', '<', now())->update(['is_active' => false]);
        })->dailyAt('00:00')->name('coupons:expire');

        // 3. Check low inventory & dispatch alert emails hourly
        $schedule->job(new \App\Jobs\SendLowStockAlertJob())->hourly()->name('stock:check-alerts');

        // 4. Nightly payment gateway reconciliation at 2:00 AM
        $schedule->job(new \App\Jobs\ProcessPaymentReconciliationJob())->dailyAt('02:00')->name('payments:reconcile');

        // 5. Cleanup temporary export files daily at 3:00 AM
        $schedule->call(function () {
            \Illuminate\Support\Facades\Storage::disk('local')->deleteDirectory('temp_exports');
        })->dailyAt('03:00')->name('cleanup:temp-files');

        // 6. Recover abandoned carts daily at 10:00 AM
        $schedule->call(function () {
            \Illuminate\Support\Facades\Log::info("Running abandoned cart recovery schedule...");
        })->dailyAt('10:00')->name('carts:recover-abandoned');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
