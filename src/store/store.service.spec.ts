import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { StoreService } from './store.service';
import { FileService } from '../file/file.service';
import { StoreGateway } from './store.gateway';
import { Image } from './entities/image.entity';
import { User } from '../users/entities/user.entity';
import { CustomErrors } from '../common-files/constants/custom-errors';
import { RoleType } from '../interfaces';
import {
  BUCKET_NAME,
  BUCKET_THUMBNAILS,
} from '../common-files/constants/constants';

describe('StoreService', () => {
  let service: StoreService;

  // Создаем моки (имитации) для всех зависимостей
  const mockFileService = {
    uploadFile: jest.fn(),
    removeFile: jest.fn(),
    getFilePath: jest.fn(),
  };

  const mockStoreGateway = {
    emitToUser: jest.fn(),
  };

  const mockImageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: FileService, useValue: mockFileService },
        { provide: StoreGateway, useValue: mockStoreGateway },
        { provide: getRepositoryToken(Image), useValue: mockImageRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Очищаем моки после каждого теста
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    const mockFile = {
      originalname: 'test.png',
      mimetype: 'image/png',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    const mockDto = {
      id: 'user-123',
      title: 'My Photo',
      author: 'John Doe',
      file: mockFile,
    };

    it('should successfully upload a file and save metadata', async () => {
      // Настраиваем поведение моков для успешного сценария
      const mockUser = {
        id: 'user-123',
        login: 'test@mail.ru',
        role: RoleType.USER,
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFileService.uploadFile.mockResolvedValue({
        path: 'uuid.png',
        thumbnailPath: 'thumb_uuid.png',
        bucket: 'images',
      });

      mockImageRepository.save.mockImplementation((img: Image) => {
        img.id = 'img-123';
        return Promise.resolve(img);
      });

      const result = await service.uploadFile(mockDto);

      // Проверяем, что все зависимости были вызваны с правильными параметрами
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockDto.id },
      });
      expect(mockStoreGateway.emitToUser).toHaveBeenCalledWith(
        mockDto.id,
        'upload_status',
        expect.objectContaining({ status: 'processing' }),
      );

      // ИСПРАВЛЕНО: Теперь мы ожидаем, что метод будет вызван с тремя аргументами (файл и два бакета)
      expect(mockFileService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        BUCKET_NAME,
        BUCKET_THUMBNAILS,
      );

      expect(mockImageRepository.save).toHaveBeenCalled();
      expect(mockStoreGateway.emitToUser).toHaveBeenCalledWith(
        mockDto.id,
        'upload_status',
        expect.objectContaining({ status: 'done' }),
      );

      expect(result).toEqual({ success: true });
    });

    it('should throw BadRequestException if user does not exist', async () => {
      // Настраиваем мок так, чтобы пользователь не был найден
      mockUserRepository.findOne.mockResolvedValue(null);

      // Проверяем, что метод выбрасывает нужную ошибку
      await expect(service.uploadFile(mockDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadFile(mockDto)).rejects.toThrow(
        CustomErrors.USER_IS_NOT_EXIST,
      );

      // Проверяем, что загрузка файла НЕ вызывалась
      expect(mockFileService.uploadFile).not.toHaveBeenCalled();
    });
  });
});
