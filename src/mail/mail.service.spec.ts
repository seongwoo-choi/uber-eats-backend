import { MailService } from './mail.service';
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from '../common/common.constant';
import got from 'got';
import * as FormData from 'form-data';

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('got');
jest.mock('form-data');

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

  describe('sendEmail', () => {
    it('send email', async () => {
      const ok = await service.sendEmail('', '', []);
      // append 는 new FormData() 로 객체를 만들고 난 후에 사용하기 때문에 prototype 을 사용
      // class 를 spy 하기 위해서 prototype 을 spy 했다.
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      expect(formSpy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
      );
      expect(ok).toEqual(true);
    });
  });

  it('fails on error', async () => {
    // got.post 가 호출될 때 error 가 생기도록 할 것이다.
    // got.post 구현체를 mock 하겠다.
    jest.spyOn(got, 'post').mockImplementation(() => {
      throw new Error();
    });
    const ok = await service.sendEmail('', '', []);
    expect(ok).toEqual(false);
  });
});
