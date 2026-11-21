<?php

/**
 * Storage Link Helper for Shared Hosting
 *
 * Place in public/ directory. Visit https://yourdomain.com/storage-link.php once,
 * then DELETE this file for security.
 */

$target = dirname(__DIR__) . '/storage/app/public';
$shortcut = __DIR__ . '/storage';

if (file_exists($shortcut)) {
    echo "<h2>Notice:</h2><p>Storage link or directory already exists at: <code>{$shortcut}</code></p>";
} else {
    if (@symlink($target, $shortcut)) {
        echo "<h2>Success!</h2><p>Storage symlink successfully created:</p>";
        echo "<p><code>{$shortcut}</code> &rarr; <code>{$target}</code></p>";
        echo "<p><strong>Important:</strong> Please delete <code>storage-link.php</code> now.</p>";
    } else {
        echo "<h2>Error</h2><p>Failed to create symlink. If your hosting provider disables symlink(), consider enabling SSH access or contacting Hostinger support.</p>";
    }
}
