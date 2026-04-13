import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const expressReq = req as unknown as Request;
    const forwardedFor = expressReq.headers['x-forwarded-for'];
    const realIp =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0]
        : expressReq.ip;

    return Promise.resolve(realIp || 'unknown-ip');
  }

  protected handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context } = requestProps;
    const req = context.switchToHttp().getRequest<Request>();

    if (req.method === 'OPTIONS') {
      return Promise.resolve(true);
    }

    return super.handleRequest(requestProps);
  }
}
