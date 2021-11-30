import { Test } from '@nestjs/testing';
import { UserService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { JwtService } from '../jwt/jwt.service';
import { MailService } from '../mail/mail.service';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
});

// const mockRepository = {
//   delete: jest.fn(),
//   findOne: jest.fn(),
//   save: jest.fn(),
//   create: jest.fn(),
// };

const mockJwtService = {
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
};

const mockMailService = {
  // private async sendEmail => 사용 X
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<
  Record<keyof Repository<User>, jest.Mock>
>;

describe('UserService', () => {
  // 모든 테스트에서 UserService 를 사용하고자 한다. => beforeAll 함수의 밖인 최상단에 let service 를 생성
  let service: UserService;
  // mockRepository 생성 및 타입 생성 => 진짜 Repository 의 함수를 모두 가져올 것이다.
  // Record 는 타입 T 의 요소 K 의 집합으로 타입을 만들어주는 TypeScript 이다.
  // Record<'hello', number> => 요소 K 는 넘버 타입의 hello.. hello 는 넘버 타입이다.
  // 여기서 중요한 것은 Repository 의 모든 키를 가져오고 싶다는 것 => keyof Repository<Entity>, 변환할 타입(jest.Mock)
  // 요소의 집합이란 건 UserRepository 의 모든 요소들을 말한다. find, create, save 등 등.. 그리고 이것들의 타입은 mock 이다.
  let userRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  // 모듈을 만든다 => 이 모듈을 유저 서비스 단 하나만을 갖는다.
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0,
    };

    // mock 은 함수의 반환값을 속일 수 있다.
    it('유저가 존재하면 실패', async () => {
      // 즉, findOne 의 값은 DB 에서 쿼리문을 날려서 조회한 값이 아닌 jest 로 속인 아래의 값이다.
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'asdads@naver.com',
      });
      // service.createAccount 실행 => userRepository.findOne => jest 가 낚아채서 위의 값으로 반환한다.
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });
    it('유저가 존재하면 성공', async () => {
      // 모든 return value 를 다 mock 해야 한다.
      // const exists = await this.userRepository.findOne({ email }); => undefined 리턴, 유저는 존재 x
      await userRepository.findOne.mockResolvedValue(undefined);
      // userRepository.create 를 호출할 때 create 는 entity 인 user 를 리턴한다는 것
      // create 한 똑같은 object 를 리턴
      userRepository.create.mockReturnValue(createAccountArgs);
      // save 도 똑같은 user object 를 리턴
      userRepository.save.mockResolvedValue(createAccountArgs);
      // verification 의 return value 는 user 가 있는 object, verification.create 안에 user 가 있다.
      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      // verificationsRepository.save 는 또 하나의 mock 을 리턴
      // string 이 포함되어 있는 또 하나의 코드를 리턴한다.
      verificationsRepository.save.mockResolvedValue({ code: 'code' });

      // value 를 다 mock 했으면 service 를 호출
      // create 테스트 이후 save 테스트 위해 service.createAccount 실행
      const result = await service.createAccount(createAccountArgs);
      // userRepository.create() 메서드가 한 번 만 call 될거라고 기대
      // toHaveBeenCalledTimes 를 사용해서 메서드가 몇 번 불릴지 테스트할 수 있다.
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      // toHaveBeenCalledWith -> 어떤 값들이 호출됐는지 테스트 할 수 있다.
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);

      //const verification = await this.verifications.save(this.verifications.create({ user }));
      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      // this.mailService.sendVerificationEmail(user.email, verification.code); test
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      // 어떤 function 의 type 의 argument 든 체크할 수 있다.
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });

    it('exception 이 발생하면 fail', async () => {
      // findOne fail, mockRejectedValue => error 발생
      // findOne 은 reject => await 가 실패한다.
      // mocking 덕에 function 의 value 를 명시할 수 있고, function 의 행동도 명시할 수 있다.
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      console.log(result);
      expect(result).toEqual({
        ok: false,
        error: "Couldn't create account",
      });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
    };
    it('유저가 존재하지 않으면 실패', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);
      // 모든 테스트에서 동일한 mocks 를 공유하고 있기 때문에 모든 findOne 의 갯수가 나온다.
      // 모든 테스트 모듈을 독립적으로 만들어줘야 한다 => BeforeAll 에서 BeforeEach 로 변경
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({ ok: false, error: 'User not found' });
    });

    it('패스워드가 틀리면 실패', async () => {
      // id, checkPassword function 이 포함되어 있는 user object 를 return
      // checkPassword function 는 boolean 을 리턴
      const mockedUser = {
        // Promise 를 리턴하는 mock function => await mockedUser.checkPassword => true 가 리턴된다.
        // mockResolvedValue 와 하는 일이 같다.
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      console.log(result);
      expect(result).toEqual({ ok: false, error: 'Wrong password' });
    });

    it('패스워드가 일치하면 token 을 리턴', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArgs);
      console.log(result);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'signed-token-baby' });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('존재하는 유저를 찾는다.', async () => {
      userRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);

      console.log(result);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });
    it('should fail if no user is found', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: 'User Not Found' });
    });
  });
  it.todo('editProfile');
  it.todo('verifyEmail');
});
