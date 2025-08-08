// User permissions based on backend permission system
// These would need to match the actual permission flags from the backend
export const UserPermissions = {
  // Basic permissions
  LOGGED_IN: 1 << 0,           // 1
  
  // Moderation permissions
  MODERATE_RECORDS: 1 << 1,    // 2
  MODERATE_PLAYERS: 1 << 2,    // 4
  VIEW_MOD_LOGS: 1 << 3,       // 8
  
  // Admin permissions
  MANAGE_API_KEYS: 1 << 4,     // 16
  ADMIN_PANEL: 1 << 5,         // 32
  
  // System permissions
  SUPER_ADMIN: 1 << 31,        // Very high value
} as const;

export type UserPermissionValue = typeof UserPermissions[keyof typeof UserPermissions];

// Helper functions for user permissions
export const hasUserPermission = (userPermissions: number, permission: UserPermissionValue): boolean => {
  return (userPermissions & permission) !== 0;
};

export const canManageApiKeys = (userPermissions: number): boolean => {
  return hasUserPermission(userPermissions, UserPermissions.MANAGE_API_KEYS) ||
         hasUserPermission(userPermissions, UserPermissions.SUPER_ADMIN);
};

export const canModerate = (userPermissions: number): boolean => {
  return hasUserPermission(userPermissions, UserPermissions.MODERATE_RECORDS) ||
         hasUserPermission(userPermissions, UserPermissions.MODERATE_PLAYERS) ||
         hasUserPermission(userPermissions, UserPermissions.SUPER_ADMIN);
};

export const isAdmin = (userPermissions: number): boolean => {
  return hasUserPermission(userPermissions, UserPermissions.ADMIN_PANEL) ||
         hasUserPermission(userPermissions, UserPermissions.SUPER_ADMIN);
};
