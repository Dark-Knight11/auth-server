import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from 'src/jwt/jwt.service';
import { IS_PUBLIC_ENDPOINT } from '../decorators';
import { isJWT } from 'class-validator';
import { TokenType } from 'src/jwt/enums/token-type.enum';
import { Request } from 'express-serve-static-core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_ENDPOINT,
      [context.getHandler(), context.getClass()],
    );
    const activate = await this.setHttpHeader(
      context.switchToHttp().getRequest(),
      isPublic,
    );
    if (!activate) {
      throw new UnauthorizedException();
    }
    return activate;
  }

  private async setHttpHeader(
    req: Request,
    isPublic: boolean,
  ): Promise<boolean> {
    const auth = req.headers?.authorization;
    if (auth == null || auth == undefined || auth.length === 0) {
      return isPublic;
    }

    const authArr = auth.split(' ');
    const bearer = authArr[0];
    const token = authArr[1];

    if (bearer == undefined || bearer == null || bearer != 'Bearer') {
      return isPublic;
    }
    if (token == undefined || token == null || !isJWT(token)) {
      return isPublic;
    }

    try {
      const { id } = await this.jwtService.verifyToken(token, TokenType.ACCESS);
      req.user = id;
      return true;
    } catch (_) {
      return isPublic;
    }
  }
}
