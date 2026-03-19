import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { Logger } from '@nestjs/common';
import { IJwtPayload } from '../interfaces';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class StoreGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(StoreGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Токен может прийти в auth.token (рекомендуется) или в заголовках
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers['authorization']?.split(' ')[1] as string);

      if (!token) {
        throw new Error('No token provided');
      }

      const payload: IJwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.jwtOptions.jwtAccessTokenSecret,
      });

      // Присоединяем сокет к "комнате" с именем ID пользователя
      // Это позволит отправлять сообщения конкретному пользователю
      void client.join(payload.sub);
      this.logger.log(
        `Client connected: ${client.id} (User ID: ${payload.sub})`,
      );
    } catch (error) {
      let errorMessage = 'Authentication failed';

      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          errorMessage = 'Token expired';
        } else if (error.name === 'JsonWebTokenError') {
          errorMessage = 'Invalid token';
        } else {
          errorMessage = error.message;
        }
      }

      this.logger.warn(
        `Client connection rejected: ${client.id} - Reason: ${errorMessage}`,
      );

      // Отправляем понятную ошибку клиенту перед отключением
      client.emit('error', { message: errorMessage });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitToUser(userId: string, event: string, data: unknown) {
    this.server.to(userId).emit(event, data);
  }
}
