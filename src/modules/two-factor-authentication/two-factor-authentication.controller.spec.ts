import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorAuthenticationController } from './two-factor-authentication.controller';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

describe('TwoFactorAuthenticationController', () => {
  let controller: TwoFactorAuthenticationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwoFactorAuthenticationController],
      providers: [TwoFactorAuthenticationService],
    }).compile();

    controller = module.get<TwoFactorAuthenticationController>(
      TwoFactorAuthenticationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
