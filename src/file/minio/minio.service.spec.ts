import { Test, TestingModule } from '@nestjs/testing';
import { MinioService } from './minio.service';
import { MinioService as MinioServiceLibrary } from 'nestjs-minio-client';

describe('MinioService', () => {
  let service: MinioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        {
          provide: MinioServiceLibrary,
          useValue: {
            client: {
              bucketExists: jest.fn(),
              makeBucket: jest.fn(),
              presignedUrl: jest.fn(),
              putObject: jest.fn(),
              removeObject: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MinioService>(MinioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
