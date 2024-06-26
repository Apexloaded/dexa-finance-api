import { join } from 'path';
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailEventEmitter } from './email.emitter';
import { EmailEventListener } from './email.listener';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => {
        const path = join(__dirname, '../..', 'client', 'templates');
        return {
          transport:
            'smtps://no_reply@apexloaded.com:_No1Repl.yM@smtppro.zoho.com',
          defaults: {
            from: '"Dexapay" <no_reply@apexloaded.com>',
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
    }),
  ],
  controllers: [EmailEventListener],
  providers: [EmailService, EmailEventEmitter],
  exports: [EmailService, EmailEventEmitter],
})
export class EmailModule {}
