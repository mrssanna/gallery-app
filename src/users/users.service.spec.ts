import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import {
  mockCreateUser,
  mockUserId,
  mockProfile,
  mockProfileBeforeUpdate,
  mockUpdateProfileRequest,
  mockUpdateProfileResponse,
  mockGetAllRequest,
  mockGetAllResponse,
} from '../mock-data/mock-data';
import { GetAllUsersDto } from './dto/get-all-users.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    exists: jest.fn(),
    create: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user if it isnt already exist', async () => {
      mockUserRepository.exists.mockResolvedValue(false);
      const userInstance = new User(mockCreateUser);
      mockUserRepository.create.mockReturnValue(userInstance);
      mockUserRepository.save.mockResolvedValue(userInstance);

      const { login, password } = mockCreateUser;
      const result = await service.createUser(login, password);

      expect(mockUserRepository.exists).toHaveBeenCalledWith({
        where: { login },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(mockCreateUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith(userInstance);

      expect(result).toEqual(userInstance);
    });

    it('should throw BadRequestException if user is already exists', async () => {
      mockUserRepository.exists.mockResolvedValue(true);

      const { login, password } = mockCreateUser;
      await expect(service.createUser(login, password)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockUserRepository.exists).toHaveBeenCalledWith({
        where: { login },
      });
    });
  });

  describe('findAll', () => {
    it('should get users by query params', async () => {
      const mockUsers = mockGetAllResponse.node;
      const mockCount = mockGetAllResponse.node.length;
      mockUserRepository.findAndCount.mockResolvedValue([mockUsers, mockCount]);

      const result = await service.findAll(mockGetAllRequest as GetAllUsersDto);

      expect(mockUserRepository.findAndCount).toHaveBeenCalled();
      expect(result.node).toEqual(mockUsers);
      expect(result.pageInfo.totalCount).toEqual(mockCount);
      expect(result.pageInfo.totalPageCount).toEqual(1);
    });
  });

  describe('getProfile', () => {
    it('should return an user profile if found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockProfile);

      const result = await service.getProfile(mockUserId);

      expect(result).toEqual(mockProfile);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUserId,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getProfile(mockUserId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUserId,
      });
    });
  });

  describe('updateProfile', () => {
    it('should update an user profile if found', async () => {
      const mockUpdateProfileRequestData = {
        ...{ id: mockUserId },
        ...mockUpdateProfileRequest,
      };

      mockUserRepository.findOneBy.mockResolvedValue(mockProfileBeforeUpdate);
      mockUserRepository.save.mockResolvedValue(mockUpdateProfileResponse);

      const result = await service.updateProfile(mockUpdateProfileRequestData);

      expect(result).toEqual(mockUpdateProfileResponse);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUpdateProfileRequestData.id,
      });
    });

    it('should throw BadRequestException if user is not exists', async () => {
      const mockUpdateProfileRequestData = {
        ...{ id: mockUserId },
        ...mockUpdateProfileRequest,
      };

      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateProfile(mockUpdateProfileRequestData),
      ).rejects.toThrow(BadRequestException);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUpdateProfileRequestData.id,
      });
    });
  });
});
