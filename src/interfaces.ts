import { BUCKET_NAME } from './common-files/constants/constants';

export enum GenderType {
  MALE = 'мужской',
  FEMALE = 'женский',
}

export enum RoleType {
  ADMIN = 'admin',
  USER = 'user',
}

export interface IUserRequest {
  sub: string;
}

export interface IJwtPayload {
  sub: string;
  login: string;
  role: RoleType;
}

export interface IRefreshJwtPayload {
  sub: string;
  login: string;
}

// eslint-disable-next-line
export type BucketType = typeof BUCKET_NAME | string; // TODO: fix it?

export enum ImageFormat {
  PNG = 'image/png',
  JPG = 'image/jpeg',
  // HEIC = 'image/heic',
}

export enum SortImagesFieldType {
  CREATED_AT = 'createdAt',
  TITLE = 'title',
}

export enum SortUsersFieldType {
  CREATED_AT = 'createdAt',
  TITLE = 'login',
}

export enum SortOrderType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface MinioOptions {
  endPoint: string;
  port: number;
  accessKey: string;
  secretKey: string;
  useSSL: boolean;
  publicURI: string;
}

export interface MinioConfigurationFactory {
  create(): Promise<MinioOptions>;
}
