import {
  GenderType,
  RoleType,
  SortOrderType,
  SortUsersFieldType,
} from '../interfaces';

// Create user
export const mockCreateUser = {
  login: 'test@mail.ru',
  password: 'password_hash',
};

// Gell all users
export const mockGetAllRequest = {
  pageNo: 1,
  perPage: 5,
  role: RoleType.USER,
  sortField: SortUsersFieldType.CREATED_AT,
  sortOrder: SortOrderType.DESC,
};

export const mockGetAllResponse = {
  node: [
    {
      id: '4b758527-78a3-470d-a4d2-cec8175a803e',
      login: 'test@mail.ru',
      role: RoleType.USER,
      gender: GenderType.MALE,
      firstName: 'Иван',
      middleName: 'Иванович',
      lastName: 'Иванов',
      createdAt: '2025-01-30T20:17:24.800Z',
      updatedAt: '2025-01-30T20:17:24.800Z',
    },
  ],
  pageInfo: {
    pageNo: 1,
    perPage: 5,
    totalPageCount: 0,
    totalCount: 0,
  },
};

// Get profile
export const mockUserId = '4b758527-78a3-470d-a4d2-cec8175a803e';

export const mockProfile = {
  id: '4b758527-78a3-470d-a4d2-cec8175a803e',
  login: 'test@mail.ru',
  role: RoleType.USER,
  gender: GenderType.MALE,
  firstName: 'Иван',
  middleName: 'Иванович',
  lastName: 'Иванов',
  createdAt: '2025-01-30T20:17:24.800Z',
  updatedAt: '2025-01-30T20:17:24.800Z',
};

// Update profile
export const mockProfileBeforeUpdate = {
  id: '4b758527-78a3-470d-a4d2-cec8175a803e',
  login: 'test@mail.ru',
  role: RoleType.USER,
  gender: GenderType.MALE,
  firstName: 'Иван',
  middleName: 'Иванович',
  lastName: 'Иванов',
  createdAt: '2025-01-30T20:17:24.800Z',
  updatedAt: '2025-01-30T20:17:24.800Z',
};

export const mockUpdateProfileRequest = {
  gender: GenderType.MALE,
  firstName: 'Петр',
  middleName: 'Петрович',
  lastName: 'Петров',
};

export const mockUpdateProfileResponse = {
  id: '4b758527-78a3-470d-a4d2-cec8175a803e',
  login: 'test@mail.ru',
  role: RoleType.USER,
  gender: GenderType.MALE,
  firstName: 'Петр',
  middleName: 'Петрович',
  lastName: 'Петров',
  createdAt: '2025-01-30T20:17:24.800Z',
  updatedAt: '2025-01-30T20:17:24.800Z',
};
