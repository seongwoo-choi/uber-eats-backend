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
});

// const mockRepository = {
//   delete: jest.fn(),
//   findOne: jest.fn(),
//   save: jest.fn(),
//   create: jest.fn(),
// };

const mockJwtService = {
  sign: jest.fn(),
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

  // 모듈을 만든다 => 이 모듈을 유저 서비스 단 하나만을 갖는다.
  beforeAll(async () => {
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
    userRepository = module.get(getRepositoryToken(User));
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
      // const exists = await this.userRepository.findOne({ email }); => undefined 리턴
      await userRepository.findOne.mockResolvedValue(undefined);
      userRepository.create.mockReturnValue(createAccountArgs);
      // create 테스트 이후 save 테스트 위해 service.createAccount 실행
      await service.createAccount(createAccountArgs);
      // userRepository.create() 메서드가 한 번 만 call 될거라고 기대
      // toHaveBeenCalledTimes 를 사용해서 메서드가 몇 번 불릴지 테스트할 수 있다.
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      // toHaveBeenCalledWith -> 어떤 값들이 호출됐는지 테스트 할 수 있다.
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);
    });
  });
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
