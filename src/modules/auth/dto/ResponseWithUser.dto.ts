import { User } from '../entities/user.entity';

export class ResponseWithUser {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  isTwoFactorAuthenticationEnabled: boolean;
  role: string;

  constructor(user: User) {
    this.id = user.id;
    this.givenName = user.givenName;
    this.familyName = user.familyName;
    this.email = user.email;
    this.isTwoFactorAuthenticationEnabled =
      user.isTwoFactorAuthenticationEnabled;
    this.role = user.role;
  }
}
