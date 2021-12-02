import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { JwtService } from './jwt.service';
import { UsersService } from '../users/user.service';

// DI 를 하기 위해서 Injectable 어노테이션 사용
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  // @Injectable() 어노테이션 덕분에 DI 가능
  constructor(
    private readonly jwtService: JwtService,
    // UserModule 에서 UserService 를 exports 해줘야 이곳에서 DI 할 수 있다.
    private readonly usersService: UsersService,
  ) {}

  // req, res 를 받아서 어떤 처리를 해준 다음 next() 를 호출해야 한다.
  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        // token 을 verify 해서 올바른 토큰인지 아닌지 확인한다. => decode 하여 암호해독 된 token 을 준다.
        // .toString() => 문자열로 변환
        const decoded = this.jwtService.verify(token.toString());

        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          req['user'] = await this.usersService.findById(decoded['id']);
        }
      } catch (e) {
        console.log(e);
      }
    }
    next();
  }
}

// export function JwtMiddleWare(req: Request, res: Response, next: NextFunction) {
//   console.log(req.headers);
//   next();
// }
