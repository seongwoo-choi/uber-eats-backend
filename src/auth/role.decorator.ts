import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

type AllowedRoles = keyof typeof UserRole | 'Any';

export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
