<?php

namespace App\Console\Commands;

use App\Models\AdminUser;
use App\Models\Role;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create 
                            {--name= : The name of the administrator}
                            {--email= : The email address of the administrator}
                            {--mobile= : The mobile number of the administrator}
                            {--password= : The administrator password}
                            {--role=super_admin : The role slug (defaults to super_admin)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Interactively and securely create a new administrator account';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info("=== Create New Administrator ===");

        // 1. Get or prompt for Name
        $name = $this->option('name') ?: $this->ask('Administrator full name', 'Super Admin');

        // 2. Get or prompt for Email with validation
        $email = $this->option('email');
        while (!$email || Validator::make(['email' => $email], ['email' => 'required|email'])->fails()) {
            if ($email) {
                $this->error("Invalid email address format. Please try again.");
            }
            $email = $this->ask('Administrator email address');
        }

        // 3. Get or prompt for Mobile
        $mobile = $this->option('mobile') ?: $this->ask('Administrator mobile phone (e.g. +919876543210)', '+919999999999');

        // 4. Check if Admin already exists
        $existingAdmin = AdminUser::where('email', $email)->first();
        if ($existingAdmin) {
            $this->warn("An administrator with email [{$email}] already exists.");
            if (!$this->confirm('Do you want to reset their password and assign the role?', true)) {
                $this->info("Operation cancelled.");
                return Command::SUCCESS;
            }
        }

        // 5. Get or prompt for Password (hidden from screen)
        $password = $this->option('password');
        if (!$password) {
            while (true) {
                $password = $this->secret('Enter admin password (minimum 8 characters)');
                if (strlen($password) < 8) {
                    $this->error('Password must be at least 8 characters long.');
                    continue;
                }
                $confirmPassword = $this->secret('Confirm admin password');
                if ($password !== $confirmPassword) {
                    $this->error('Passwords do not match. Please try again.');
                    continue;
                }
                break;
            }
        }

        // 6. Find or ensure Role
        $roleSlug = $this->option('role') ?: 'super_admin';
        $role = Role::where('slug', $roleSlug)->first();
        if (!$role) {
            $role = Role::firstOrCreate(
                ['slug' => 'super_admin'],
                [
                    'name' => 'Super Administrator',
                    'description' => 'Full access to all system features and settings.',
                    'is_system' => true,
                ]
            );
        }

        // 7. Create or update user
        if ($existingAdmin) {
            $existingAdmin->update([
                'name' => $name,
                'mobile' => $mobile,
                'password' => Hash::make($password),
                'status' => 'active',
            ]);
            $admin = $existingAdmin;
        } else {
            $admin = AdminUser::create([
                'name' => $name,
                'email' => $email,
                'mobile' => $mobile,
                'password' => Hash::make($password),
                'status' => 'active',
            ]);
        }

        // 8. Attach role
        $admin->roles()->sync([$role->id]);

        $this->newLine();
        $this->info("✓ Administrator successfully created and assigned to [{$role->name}] role!");
        $this->table(
            ['ID', 'Name', 'Email', 'Role', 'Status'],
            [
                [$admin->id, $admin->name, $admin->email, $role->name, $admin->status]
            ]
        );

        $loginUrl = url('/admin');
        $this->line("You can now log in at: <comment>{$loginUrl}</comment>");

        return Command::SUCCESS;
    }
}
