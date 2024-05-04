import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators';
import fs from 'fs';
import path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get('logs')
  // @Public()
  // getLogs(@Res() res) {
  //   fs.readdir(path.join(__dirname, 'logs'), (err, files) => {
  //     if (err) {
  //       res.status(500).send('Unable to read logs directory');
  //     } else {
  //       res.send(files);
  //     }
  //   });
  // }
}
