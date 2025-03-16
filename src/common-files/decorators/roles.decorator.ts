import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/constants';

export const Roles = (...roles) => SetMetadata(ROLES_KEY, roles);
