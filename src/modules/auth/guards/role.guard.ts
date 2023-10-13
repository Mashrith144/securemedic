import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import Role from 'src/common/role.enum';
import RequestWithUser from '../dto/RequestWithUser.dto';
import JwtAuthenticationGuard from './jwtAuthentication.guard';

const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin extends JwtAuthenticationGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      return user.role === role;
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;
