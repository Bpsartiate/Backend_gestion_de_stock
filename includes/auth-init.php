<?php
/**
 * Page Protection & Auth Initialization
 * Include this at the top of every protected page
 * 
 * Usage: <?php include_once 'includes/auth-init.php'; ?>
 */

session_start();

// Check if user has a valid session token in localStorage (client-side check)
// This is a basic check - the full validation happens on the backend via API

// Calculate BASE_URL (relative path to the root for both PHP and JavaScript)
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
$currentUrl = $protocol . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']);
$BASE_URL = preg_replace('/\/(pages|app|admin).*/', '', $currentUrl);

?>
<script>
  // Make BASE_URL available to client-side scripts
  <?php 
    // Relative path to root (without domain for SPA compatibility)
    $baseDir = preg_replace('/\/(pages|app|admin).*/', '', dirname($_SERVER['PHP_SELF']));
    if (empty($baseDir) || $baseDir === '/') $baseDir = '';
  ?>
  window.BASE_URL = '<?php echo $baseDir; ?>';
  window.PAGE_BASE_URL = '<?php echo $baseDir; ?>';
</script>
