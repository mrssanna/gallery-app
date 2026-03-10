import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const method = request.method;
    const url = request.url;
    const body = request.body as unknown;

    const now = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - Body: ${JSON.stringify(
        this.sanitize(body),
      )}`,
    );

    return next.handle().pipe(
      tap((data: unknown) => {
        const delay = Date.now() - now;
        this.logger.log(
          `Outgoing Response: ${method} ${url} ${response.statusCode} - ${delay}ms - Body: ${JSON.stringify(
            this.sanitize(data),
          )}`,
        );
      }),
    );
  }

  private sanitize(data: unknown): unknown {
    if (!data) return data;
    if (typeof data !== 'object') return data;

    // Handle arrays (e.g. list of users)
    if (Array.isArray(data)) {
      return data.map((item: unknown) => this.sanitize(item));
    }

    // Handle objects
    const sanitized = { ...(data as Record<string, unknown>) };
    const sensitiveKeys = ['password', 'accessToken', 'refreshToken', 'token'];

    for (const key in sanitized) {
      if (sensitiveKeys.includes(key)) {
        sanitized[key] = '***';
      } else if (
        typeof sanitized[key] === 'object' &&
        sanitized[key] !== null
      ) {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    }

    return sanitized;
  }
}
