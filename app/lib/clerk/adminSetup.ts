import { clerkClient } from '@clerk/nextjs/server';
import type { User } from '@clerk/nextjs/server';

/**
 * Utility to set admin role for a user in Clerk
 * This should only be used in development or by super admins
 */
export async function setUserAsAdmin(userId: string): Promise<void> {
  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: 'admin',
        isAdmin: true,
      },
    });
    console.log(`User ${userId} has been set as admin`);
  } catch (error) {
    console.error('Failed to set user as admin:', error);
    throw error;
  }
}

/**
 * Utility to remove admin role from a user in Clerk
 */
export async function removeUserAsAdmin(userId: string): Promise<void> {
  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: 'user',
        isAdmin: false,
      },
    });
    console.log(`Admin role removed from user ${userId}`);
  } catch (error) {
    console.error('Failed to remove admin role:', error);
    throw error;
  }
}

/**
 * Check if a user is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.publicMetadata?.role === 'admin' || 
           user.publicMetadata?.isAdmin === true;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}

/**
 * Get all admin users
 */
export async function getAllAdminUsers(): Promise<User[]> {
  try {
    const client = await clerkClient();
    const response = await client.users.getUserList({
      limit: 100,
    });
    
    return response.data.filter((user: User) => 
      user.publicMetadata?.role === 'admin' || 
      user.publicMetadata?.isAdmin === true
    );
  } catch (error) {
    console.error('Failed to get admin users:', error);
    return [];
  }
}

/**
 * Utility to set global admin role for a user in Clerk
 * This should only be used in development or by super admins
 */
export async function setUserAsGlobalAdmin(userId: string): Promise<void> {
  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: 'global_admin',
        isAdmin: true,
      },
    });
    console.log(`User ${userId} has been set as global_admin`);
  } catch (error) {
    console.error('Failed to set user as global_admin:', error);
    throw error;
  }
}

/**
 * Utility to remove global admin role from a user in Clerk
 */
export async function removeUserAsGlobalAdmin(userId: string): Promise<void> {
  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: 'user',
        isAdmin: false,
      },
    });
    console.log(`Global admin role removed from user ${userId}`);
  } catch (error) {
    console.error('Failed to remove global admin role:', error);
    throw error;
  }
}

/**
 * Check if a user is a global admin
 */
export async function isUserGlobalAdmin(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.publicMetadata?.role === 'global_admin';
  } catch (error) {
    console.error('Failed to check global admin status:', error);
    return false;
  }
} 