import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection } from 'typeorm';
import exp from 'constants';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  describe('createAccount', () => {
    const EMAIL = 'csw0326@naver.com';
    it('should create account', () => {
      // /graphql 엔드포인트로 posting 을 한다.
      // graphql 은 엄청 많은 post request 무더기!
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            createAccount(input: {
              email: "${EMAIL}",
              password: "1234",
              role: Owner
            }) {
              ok
              error
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          console.log(res.body);
          expect(res.body.data.createAccount.ok).toBe('true');
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });

    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            createAccount(input: {
              email: "${EMAIL}",
              password: "1234",
              role: Owner
            }) {
              ok
              error
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          console.log(res.body);
          expect(res.body.data.createAccount.ok).toBe('false');
          expect(res.body.data.createAccount.error).toBe(
            '이미 존재하는 이메일입니다.',
          );
        });
    });
  });

  it.todo('userProfile');
  it.todo('login');
  it.todo('me');
  it.todo('verifyEmail');
  it.todo('editProfile');
});
