import { Test, TestingModule } from '@nestjs/testing';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';

describe('StoreController', () => {
  let controller: StoreController;

  const mockStoreService = {
    uploadFile: jest.fn(),
    updateFileInfo: jest.fn(),
    findAll: jest.fn(),
    removeFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [
        {
          provide: StoreService,
          useValue: mockStoreService,
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: { jwtOptions: { jwtAccessTokenSecret: 'test' } },
        }, // For AuthGuard
      ],
    }).compile();

    controller = module.get<StoreController>(StoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
