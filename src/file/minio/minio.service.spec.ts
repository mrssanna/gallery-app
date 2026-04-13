import { Test, TestingModule } from '@nestjs/testing';
import { MinioService } from './minio.service';
import { MinioService as MinioServiceLibrary } from 'nestjs-minio-client';
import { ConfigService } from '../../config/config.service';

describe('MinioService', () => {
  let service: MinioService;

  const mockConfigService = {
    minioConfig: jest.fn().mockReturnValue({
      endPoint: 'minio',
      port: 9000,
      useSSL: false,
      accessKey: 'admin',
      secretKey: 'password',
      publicURI: 'http://localhost:9000',
    }),
  };

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
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MinioService>(MinioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
