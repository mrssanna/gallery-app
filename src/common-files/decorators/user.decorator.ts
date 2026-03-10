import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequestWithUser } from '../../interfaces';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<IRequestWithUser>();
    const user = request.user;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data ? user?.[data] : user;
  },
);
