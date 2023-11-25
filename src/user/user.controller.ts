import { Body, Controller, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ChangeEmailDto } from './dto/change.email.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('/change-email')
  async changeEmail(@Body() changeEmailDto: ChangeEmailDto) {
    const user = await this.userService.updateEmail(
      changeEmailDto,
      'effc1657-1aad-4242-8632-c42c85dde229',
    );
    return user;
  }
}
