// Run this in browser console to create a test admin user
// Open DevTools (F12) → Console → Paste this code

import { db } from './src/lib/db/database';

async function createTestAdmin() {
    try {
        await db.staff.add({
            username: 'admin@test.com',
            password: 'admin123', // Plain text for now (will be hashed in production)
            pin: '1234',
            name: 'Test Admin',
            email: 'admin@test.com',
            phone: '+265999771155',
            role: 'admin',
            isActive: true,
            permissions: {},
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('✅ Test admin created!');
        console.log('Email: admin@test.com');
        console.log('Password: admin123');
        console.log('PIN: 1234');
    } catch (error) {
        console.error('Error:', error);
    }
}

createTestAdmin();
