import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { StoreService } from '../store/store.service';
import { FileService } from '../file/file.service';
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
    findOne: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };

  const mockStoreService = {
    removeFile: jest.fn(),
  };

  // ИСПРАВЛЕНО: Добавлен мок для FileService, который теперь используется в UsersService
  const mockFileService = {
    getFilePath: jest
      .fn()
      .mockResolvedValue('http://localhost:9000/avatars/test.png'),
    uploadFile: jest.fn(),
    removeFile: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: StoreService,
          useValue: mockStoreService,
        },
        {
          provide: FileService,
          useValue: mockFileService,
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
    });
  });

  describe('getProfile', () => {
    it('should return an user profile if found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockProfile);
      const result = await service.getProfile(mockUserId);
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(service.getProfile(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
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
    });
  });

  describe('updateUserByAdmin', () => {
    it('should update user and return success', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockProfileBeforeUpdate);
      mockUserRepository.save.mockResolvedValue(mockUpdateProfileResponse);

      const result = await service.updateUserByAdmin(
        'test@mail.ru',
        mockUpdateProfileRequest,
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(
        service.updateUserByAdmin('test@mail.ru', mockUpdateProfileRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should get users by query params', async () => {
      const mockUsers = mockGetAllResponse.node;
      const mockCount = mockGetAllResponse.node.length;
      mockUserRepository.findAndCount.mockResolvedValue([mockUsers, mockCount]);

      const result = await service.findAll(mockGetAllRequest as GetAllUsersDto);
      expect(result.node).toEqual(mockUsers);
      expect(result.pageInfo.totalCount).toEqual(mockCount);
    });
  });

  describe('findOneByLogin', () => {
    it('should return user if found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockProfile);
      const result = await service.findOneByLogin({ login: 'test@mail.ru' });
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(
        service.findOneByLogin({ login: 'test@mail.ru' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove user and their images', async () => {
      const mockUserWithImages = {
        ...mockProfile,
        images: [{ id: 'img1' }, { id: 'img2' }],
      };
      mockUserRepository.findOne.mockResolvedValue(mockUserWithImages);
      mockStoreService.removeFile.mockResolvedValue(true);
      mockUserRepository.remove.mockResolvedValue(true);

      const result = await service.remove({ login: 'test@mail.ru' });

      expect(mockStoreService.removeFile).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.remove).toHaveBeenCalledWith(
        mockUserWithImages,
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.remove({ login: 'test@mail.ru' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('blockUser', () => {
    it('should toggle block status', async () => {
      const mockUser = { ...mockProfile, isBlocked: false };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        isBlocked: true,
      });

      const result = await service.blockUser({ login: 'test@mail.ru' });
      expect(mockUser.isBlocked).toBe(true);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(
        service.blockUser({ login: 'test@mail.ru' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Token Management', () => {
    it('saveRefreshToken should save token', async () => {
      const mockUser = { ...mockProfile, refreshToken: '' };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        refreshToken: 'token123',
      });

      await service.saveRefreshToken(mockUserId, 'token123');
      expect(mockUser.refreshToken).toBe('token123');
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('findRefreshTokenByUserId should return token', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        refreshToken: 'token123',
      });
      const result = await service.findRefreshTokenByUserId(mockUserId);
      expect(result).toBe('token123');
    });

    it('inactivateRefreshToken should clear token', async () => {
      const mockUser = { ...mockProfile, refreshToken: 'token123' };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        refreshToken: '',
      });

      await service.inactivateRefreshToken(mockUserId);
      expect(mockUser.refreshToken).toBe('');
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });
});
