import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { MinioService } from './minio/minio.service';

describe('FileService', () => {
  let service: FileService;

  const mockMinioService = {
    uploadBuffer: jest.fn(),
    deleteFile: jest.fn(),
    getDownloadUrl: jest.fn(),
    checkBucket: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: MinioService,
          useValue: mockMinioService,
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
