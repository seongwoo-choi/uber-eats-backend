import { MailService } from './mail.service';
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from '../common/common.constant';
import got from 'got';
import * as FormData from 'form-data';

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('got', () => {});
jest.mock('form-data', () => {
  return {
    append: jest.fn(),
  };
});

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apiKey',
            domain: 'test-domain',
            fromEmail: 'test-fromEmail',
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerifiactionEmail', () => {
    it('shoul call sendEmail', () => {
      const sendVerificationArgs = {
        email: 'email@naver.com',
        code: 'code',
      };
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {
        console.log('hi everyone');
        return true;
      });
      service.sendVerificationEmail(
        sendVerificationArgs.email,
        sendVerificationArgs.code,
      );

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email',
        'verify-email',
        [
          { key: 'code', value: sendVerificationArgs.code },
          { key: 'username', value: sendVerificationArgs.email },
        ],
      );
    });
  });

  it.todo('sendEmail');
});
