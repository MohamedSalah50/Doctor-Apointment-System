// src/common/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (resource: string, action: string) => {
  return SetMetadata(PERMISSIONS_KEY, { resource, action });
};