// Key permissions based on the Rust bitflags
export const KeyPermissions = {
  SUBMIT_TIMES: 1 << 0, // 1
  SUBMIT_BULK: 1 << 1,  // 2
} as const;

export type KeyPermissionValue = typeof KeyPermissions[keyof typeof KeyPermissions];

// Helper functions
export const hasPermission = (permissions: number, permission: KeyPermissionValue): boolean => {
  return (permissions & permission) !== 0;
};

export const addPermission = (permissions: number, permission: KeyPermissionValue): number => {
  return permissions | permission;
};

export const removePermission = (permissions: number, permission: KeyPermissionValue): number => {
  return permissions & ~permission;
};

export const getPermissionNames = (permissions: number): string[] => {
  const names: string[] = [];
  if (hasPermission(permissions, KeyPermissions.SUBMIT_TIMES)) {
    names.push('Submit Times');
  }
  if (hasPermission(permissions, KeyPermissions.SUBMIT_BULK)) {
    names.push('Submit Bulk');
  }
  return names;
};
