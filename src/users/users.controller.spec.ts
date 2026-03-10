import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    findAll: jest.fn(),
    findOneByLogin: jest.fn(),
    blockUser: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          // For AuthGuard and RolesGuard
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: { jwtOptions: { jwtAccessTokenSecret: 'test' } },
        }, // For AuthGuard
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
