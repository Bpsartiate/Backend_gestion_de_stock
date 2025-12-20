# Page Protection & Auth System

This document explains how to protect all pages in your application and manage user authentication.

## Quick Start

### For Every Protected Page

Add these lines to **every page** that requires authentication:

```php
<?php include_once 'includes/auth-init.php'; ?>
```

Place this right after the opening `<body>` tag.

### For Every Protected Page - Script Includes

At the **end of your page** (before `</body>`), ensure you include:

```html
<script src="assets/js/auth-protection.js"></script>
```

This script will:
1. ✅ Check if the user has a valid token
2. ✅ Redirect to login if not authenticated
3. ✅ Fetch and display user info (name, role, photo)
4. ✅ Setup logout functionality

## How It Works

### Flow

1. **User logs in** → Token + user data saved to localStorage
2. **User visits a protected page** → `auth-protection.js` checks for token
3. **Token missing?** → User is redirected to login.php
4. **Token present?** → User info is displayed (fetched from API if possible)
5. **User clicks logout** → All data cleared + redirect to login

### What Gets Displayed

The auth system automatically fills in these elements (if they exist on your page):

**Old Style (from setting.php):**
- `#currentUserName` - User's full name
- `#currentUserRole` - User's role
- `#logoutBtn` - Logout button

**New Style (from topbar.php - in dropdown):**
- `#userNameDisplay` - User's full name
- `#userRoleDisplay` - User's role
- `#userAvatarImg` - User's avatar photo
- `#userRoleBadge` - Role badge with color
- `#nav-logout` - Logout button

### LocalStorage Keys Used

After login, save these to localStorage:

```javascript
localStorage.setItem('token', 'your_jwt_token_here');
localStorage.setItem('userId', 'user_id_from_api');
localStorage.setItem('nom', 'last_name');
localStorage.setItem('prenom', 'first_name');
localStorage.setItem('role', 'admin|superviseur|vendeur');
localStorage.setItem('photoUrl', 'https://url/to/photo.jpg');
```

The system will also fall back to:
- `authToken`, `jwt`, `accessToken`, `userToken` (for token)
- `id` (for userId)
- `userNom`, `userPrenom`, `userRole`, `userPhotoUrl` (alternate names)

## Implementation Checklist

- [ ] Include `auth-init.php` in the `<body>` tag of every protected page
- [ ] Include `auth-protection.js` before `</body>` on every protected page
- [ ] Ensure login.php sets localStorage keys after successful login
- [ ] Update all existing pages to include the protection script
- [ ] Test: Try accessing a page without logging in (should redirect to login)
- [ ] Test: Login and check that user info displays correctly
- [ ] Test: Click logout and verify redirect to login

## Pages Already Protected

✅ `entreprise.php` - Updated with auth-protection.js
✅ `setting.php` - Updated with auth-protection.js

## Pages To Update

Add to these pages:
- `affectations.php`
- `rapports.php`
- `utilisateurs.php`
- `dashboard.php` (if exists)
- Any other admin/user page

## Login.php - Required Setup

After successful login in `pages/authentication/login.php`, ensure you save:

```javascript
// After receiving token from API
localStorage.setItem('token', response.token);
localStorage.setItem('userId', response.user.id);
localStorage.setItem('nom', response.user.nom);
localStorage.setItem('prenom', response.user.prenom);
localStorage.setItem('role', response.user.role);
localStorage.setItem('photoUrl', response.user.photoUrl);
```

## Testing

1. **Test Redirect:** 
   - Open a protected page without logging in
   - Should redirect to login.php

2. **Test User Info:**
   - Login with valid credentials
   - Check that name, role, and photo display correctly

3. **Test Logout:**
   - Click logout button
   - Should clear localStorage and redirect to login

4. **Test Persistence:**
   - Login and refresh page
   - User info should still display (fetched from API)

## Backend Integration

The system makes API calls to:

```
GET /api/protected/profile/:userId
Headers: Authorization: Bearer {token}
```

Make sure your backend returns:
```json
{
  "_id": "user_id",
  "nom": "LastName",
  "prenom": "FirstName",
  "role": "admin|superviseur|vendeur",
  "photoUrl": "https://...",
  "email": "user@email.com"
}
```

## Troubleshooting

### User redirected to login immediately
- Check localStorage has `token` and `userId` keys
- Check token is not expired
- Check API endpoint returns valid user data

### User info not displaying
- Check `#currentUserName`, `#userNameDisplay` elements exist on page
- Check browser console for errors
- Check API is returning correct fields

### Logout not working
- Check `#logoutBtn` or `#nav-logout` button exists
- Check browser console for JavaScript errors
- Verify localStorage is being cleared

## Advanced Usage

### Programmatic Access

```javascript
// Get current token
const token = AuthProtection.getToken();

// Reload user info
AuthProtection.loadUserInfo();

// Force logout
AuthProtection.logout();

// Redirect to login
AuthProtection.redirectToLogin();
```

### Custom Auth Checks

If you need role-based access, add this in your page-specific JavaScript:

```javascript
const role = localStorage.getItem('role');
if(role !== 'admin'){
  alert('Admin access required');
  AuthProtection.redirectToLogin();
}
```
