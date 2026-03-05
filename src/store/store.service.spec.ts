import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StoreService } from './store.service';
import { FileService } from '../file/file.service';
import { Image } from './entities/image.entity';
import { User } from '../users/entities/user.entity';

describe('StoreService', () => {
  let service: StoreService;

  const mockFileService = {
    uploadFile: jest.fn(),
    removeFile: jest.fn(),
    getFilePath: jest.fn(),
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
        { provide: getRepositoryToken(Image), useValue: mockImageRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
