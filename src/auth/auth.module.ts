import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [
    UserModule,
    JwtModule,
    MailerModule
  ],
  providers: [AuthService]
})
export class AuthModule {}
