import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection } from 'typeorm';
import exp from 'constants';
import { ok } from 'assert';
import { log } from 'util';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: 'csw0326@naver.com',
  password: '1234',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

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
    it('should create account', () => {
      // /graphql 엔드포인트로 posting 을 한다.
      // graphql 은 엄청 많은 post request 무더기!
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            createAccount(input: {
              email: "${testUser.email}",
              password: "${testUser.password}",
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
              email: "${testUser.email}",
              password: "${testUser.password}",
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

  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(input: {
                email: "${testUser.email}",
                password: "${testUser.password}",
              }) {
                ok
                error
                token
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          // res.body 를 expect 할 것
          // res.body 내부의 data 안에서 login 을 가져온다.
          // res.body.data.login
          const {
            body: {
              data: { login },
            },
          } = res;
          console.log(res);
          expect(login.ok).toBe('true');
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token;
        });
    });

    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(input: {
                email: "${testUser.email}",
                password: "11111",
              }) {
                ok
                error
                token
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe('false');
          expect(login.error).toBe('잘못된 비밀번호입니다.');
          expect(login.token).toBe(null);
        });
    });
  });

  it.todo('userProfile');
  it.todo('me');
  it.todo('verifyEmail');
  it.todo('editProfile');
});
