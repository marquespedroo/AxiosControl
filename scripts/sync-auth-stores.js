/**
 * Emergency script to sync localStorage 'user' data to Zustand 'auth-storage'
 * Run this in the browser console if you're already logged in and need to sync the stores
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter
 * 4. Refresh the page
 */

(function syncAuthStores() {
    try {
        // Get user data from localStorage
        const userStr = localStorage.getItem('user');
        const tokenStr = localStorage.getItem('auth_token');

        if (!userStr) {
            console.error('❌ No user data found in localStorage');
            return;
        }

        const user = JSON.parse(userStr);

        // Create the Zustand auth-storage structure
        const authStorage = {
            state: {
                user: user,
                token: tokenStr || null,
                isAuthenticated: true,
                isLoading: false
            },
            version: 0
        };

        // Store in localStorage with Zustand's key
        localStorage.setItem('auth-storage', JSON.stringify(authStorage));

        console.log('✅ Auth stores synchronized successfully!');
        console.log('User:', user);
        console.log('Is Super Admin:', user.is_super_admin);
        console.log('🔄 Please refresh the page for changes to take effect');

    } catch (error) {
        console.error('❌ Error syncing auth stores:', error);
    }
})();
