import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Authentication & Users Flow (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  // Генерируем уникальный email для каждого запуска тестов
  const testUser = {
    login: `e2e_test_${Date.now()}@mail.ru`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Включаем пайпы, как в main.ts, чтобы работала валидация
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/signup (POST) - should register a new user', () => {
    return request(app.getHttpServer() as unknown as App)
      .post('/auth/signup')
      .send(testUser)
      .expect(201)
      .expect((res: request.Response) => {
        const body = res.body as Record<string, unknown>;
        expect(body.success).toBe(true);
        expect(body.accessToken).toBeDefined();
        expect(body.refreshToken).toBeDefined();
      });
  });

  it('/auth/signup (POST) - should fail if user already exists', () => {
    return request(app.getHttpServer() as unknown as App)
      .post('/auth/signup')
      .send(testUser)
      .expect(400)
      .expect((res: request.Response) => {
        const body = res.body as Record<string, unknown>;
        expect(body.message).toBe('USER_ALREADY_EXISTS');
      });
  });

  it('/auth/login (POST) - should login and return tokens', () => {
    return request(app.getHttpServer() as unknown as App)
      .post('/auth/login')
      .send(testUser)
      .expect(201)
      .expect((res: request.Response) => {
        const body = res.body as Record<string, unknown>;
        expect(body.accessToken).toBeDefined();
        expect(body.refreshToken).toBeDefined();
        // Сохраняем токен для следующего теста
        accessToken = body.accessToken as string;
      });
  });

  it('/users/profile (GET) - should return user profile using token', () => {
    return request(app.getHttpServer() as unknown as App)
      .get('/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res: request.Response) => {
        const body = res.body as Record<string, unknown>;
        expect(body.login).toBe(testUser.login);
        expect(body.id).toBeDefined();
        expect(body.role).toBe('user');
      });
  });

  it('/users/profile (GET) - should fail without token', () => {
    return request(app.getHttpServer() as unknown as App)
      .get('/users/profile')
      .expect(401);
  });

  it('/users (GET) - should fail if user is not admin', () => {
    return request(app.getHttpServer() as unknown as App)
      .get('/users?pageNo=1&perPage=10')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403); // Ожидаем 403 Forbidden, так как testUser имеет роль 'user', а не 'admin'
  });
});
