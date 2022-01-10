import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { AllowedRoles } from './role.decorator';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );

    // @SetMetadata 를 사용하지 않은 public 한 녀석들의 경우 통과
    if (!roles) {
      return true;
    }

    // @SetMetadata 로 role 이 설정된 경우 graphql 의 ExecutionContext 에서 user 를 확인한다.
    const gqlContext = GqlExecutionContext.create(context).getContext();
    console.log(gqlContext.token);
    const user: User = gqlContext['user'];
    console.log(user);
    if (!user) {
      // 이 가드를 어디서 사용하든 간에 false 를 리턴해서 request 를 막는다.
      return false;
    }

    if (roles.includes('Any')) {
      return true;
    }

    return roles.includes(user.role);
  }
}
