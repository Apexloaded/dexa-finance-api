import { join } from 'path';
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailEventEmitter } from './email.emitter';
import { EmailEventListener } from './email.listener';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const path = join(__dirname, '../..', 'client', 'templates');
        const email = configService.get<string>('SMTP_EMAIL');
        const password = configService.get<string>('SMTP_PASSWORD');
        const host = configService.get<string>('SMTP_HOST');
        return {
          transport: `smtps://${email}:${password}@${host}`,
          defaults: {
            from: `"Dexa Finance" <${email}>`,
          },
          template: {
            dir: join(path, 'views'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
          options: {
            partials: {
              dir: join(path, 'partials'),
              options: {
                strict: true,
              },
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [EmailEventListener],
  providers: [EmailService, EmailEventEmitter],
  exports: [EmailService, EmailEventEmitter],
})
export class EmailModule {}
