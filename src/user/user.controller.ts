import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ChangeEmailDto } from './dto/change.email.dto';
import { ConfigService } from '@nestjs/config';
import { GetUserParam, PasswordDto, UserUpdateDto } from './dto';
import { ResponseUserMapper } from './mappers/response-user.mapper';
import { CurrentUser, Public } from 'src/auth/decorators';
import { AuthResponseUserMapper } from 'src/auth/mappers';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('user')
@ApiTags('User')
export class UserController {
  private readonly cookiePath = '/api/auth';
  private readonly cookieName: string;
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.get<string>('REFRESH_COOKIE');
  }
  @Public()
  @Get('/:idOrUsername')
  @ApiOkResponse({
    type: ResponseUserMapper,
    description: 'The user is found and returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiNotFoundResponse({
    description: 'The user is not found.',
  })
  async getUser(@Param() params: GetUserParam) {
    const user = await this.userService.findOneByIdOrUsername(
      params.idOrUsername,
    );
    return ResponseUserMapper.map(user);
  }

  @Patch('email')
  @ApiOkResponse({
    type: AuthResponseUserMapper,
    description: 'The email is updated, and the user is returned.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body, or wrong password.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  async updateEmail(
    @CurrentUser() userId: string,
    @Body() changeEmailDto: ChangeEmailDto,
  ) {
    const user = await this.userService.updateEmail(changeEmailDto, userId);
    return AuthResponseUserMapper.map(user);
  }

  @Patch()
  @ApiOkResponse({
    type: ResponseUserMapper,
    description: 'The username is updated.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  async updateUser(
    @CurrentUser() userId: string,
    @Body() updateUserDto: UserUpdateDto,
  ) {
    const user = await this.userService.update(userId, updateUserDto);
    return ResponseUserMapper.map(user);
  }

  @Delete()
  @ApiNoContentResponse({
    description: 'The user is deleted.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body, or wrong password.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  async deleteUser(
    @CurrentUser() userId: string,
    @Body() dto: PasswordDto,
    @Res() res: Response,
  ) {
    await this.userService.delete(userId, dto);
    res
      .clearCookie(this.cookieName, { path: this.cookiePath })
      .status(HttpStatus.NO_CONTENT)
      .send();
  }
}
