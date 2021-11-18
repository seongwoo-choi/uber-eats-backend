import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constant';
import { EmailVar, MailModuleOptions } from './mail.interface';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    // module 의 providers CONFIG_OPTIONS 를 의존성 주입 받아서 사용
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    // Nest.JS 가 시작할 때 마다 이 함수를 테스트한다는 것을 표현
    // this.sendEmail('이메일 테스트', 'verify-email', );
  }

  // 모듈을 다른 프로젝트에서 사용하고 싶게 만들려면 send email only 같은 함수를 만들어야 할 수 있고
  // 이 서비스를 우리 프로젝트에 맞춰서 아주 구체적으로 만들 수 있다.

  // 이메일을 보내는 메서드 => 확장 시켜서 인증 메일을 보내는 메서드 + 주문 확인 이메일을 보내는 메서드 로 확장 시킨다.

  // 이메일을 보내는 api 를 실행시키기 위해서 CURL 을 사용한다.
  // CURL 은 콘솔에서 API 를 사용할 때 쓴다.
  // NODE.JS 에는 FrontEnd 처럼 Fetch 가 없다. 그래서 보통 패키지를 설치해야 한다.
  // => node.js 에 있는 request 패키지를 사용, node.js 에서 request 를 작성하기 아주 쉽게 해준다. => 하지만 2020 년 이후로 업데이트가 되지 않는다.
  // 그래서 GOT 패키지를 사용한다. npm i got
  private async sendEmail(
    subject: string,
    // to: string,
    template: string,
    emailVars: EmailVar[],
  ) {
    const form = new FormData();
    // -F from='Excited User <mailgun@YOUR_DOMAIN_NAME>' \
    form.append('from', `hibogo789@gmail.com <mailgun@${this.options.domain}>`);
    // 카드를 등록하지 않으면 이메일을 인증해야 된다. 그래서 내가 인증한 이메일로밖에 못보낸다.
    //-F to=bar@example.com \
    form.append('to', `how0326@naver.com`);
    // -F subject='Hello' \
    form.append('subject', subject);
    // -F text='Testing some Mailgun awesomeness!'
    // form.append('text', content);
    form.append('template', template);
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    // Quietly fail 로 실행 => 에러가 발생해도 아무한테 알리지 않는다.
    try {
      await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        method: 'POST',
        headers: {
          // Authorization 은 basic authorization 이라 불린다. => 유저명과 패스워드가 필요
          // String 값의 포맷을 인코딩하고 바꿔야 한다. base64 로 인코딩
          // curl -s --user 'api:YOUR_API_KEY' \
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      });
    } catch (error) {
      console.log(error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail(
      'Verify Your Email',
      // this.options.fromEmail,
      'verify-email',
      [
        { key: 'code', value: code },
        { key: 'username', value: email },
      ],
    );
  }
}
