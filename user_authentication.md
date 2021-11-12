authentication 이 어떻게 작동하는지 정리

header 안에 토큰을 보내고 있다. (이게 제일 중요)

헤더는 http 기술에 쓰인다. ⇒ 그래서 미들웨어를 만들어서 header 를 가져다가 jwtService.verify() 를 사용

추출한 토큰으로 DB 에서 유저 정보를 가져오고 그 유저를 request object 에 붙여서 보낸다. 미들웨어가 하는 일은 여기서 끝이다.

미들웨어를 가장 먼저 만나기 때문에 미들웨어가 원하는대로 request object 를 바꿀 수 있다. 미들웨어에 의해 바뀐 request object 를 모든 resolver 에서 사용할 수 있다.

만약 토큰이 없거나 에러가 있다면 혹은 토큰으로 유저를 찾을 수 없다면 request 에 object 를 추가하지 않는다. 그래서 말도 안되는 토큰을 보낸다면 미들웨어가 아무것도 안하고 에러를 출력한다. → invalid token

---

app.module 에서 context 를 보면 아폴로 서버의 context 나 graphql 의 context 는 모든 Resolver 에 정보를 보낼 수 있는 프로퍼티다.

context 에서 fuction 을 만들면 그 fuction 이 request object 를 줄 것이다.

request object 는 우리가 만든 user key 를 가진 http 에 해당 → req['user']

context 에 req 속성을 뽑아서 resolver 에서 @Context() context  빠르게 사용 가능

export class AppModule implements NestModule {} 에서 configure 을 오버라이딩 하고 consumer 를 통해 미들웨어를 등록할 수 있다.

여기선 JwtMiddleware 를 미들웨어로 등록했고, forRoutes 옵션으로 어떤 경로, 어떤 Http 메서드 일 때 미들웨어가 작동하는 지 설정이 가능하다.

미들웨어를 거치고 graqhql context 에 req['user'] 를 보낸다.

---

UseGuard 를 사용

guard 는 CanActivate 를 상속받고 CanActivate 는 true 나 false 를 return 해야 된다.

true → request 를 진행, false → request 를 중지

canActivate() 는 context 알규먼트를 갖는데 Nest.js 의 ExecutionContext 타입이다.

ExecutionContext 를 가져다가 GqlExecutionContext 로 바꿔야 한다. 이렇게 변경된 graphql context 는 GraphQLModule.forRoot({}) 의 context: ({req} ⇒ ({user:req['user']})); 의 context 와 같은 값이다.

gqlContext === context 이다.

---

미들웨어에서 시작해서 아폴로 서버의 context 를 거치고 authorization guard 를 거쳐서 마지막으로 Resolver 에 도착.

커스텀 데코레이터를 만들었고 이 데코레이터는 context 를 graphql context 로 변환한다.

그리고 graphql context 에서 user 를 가져오면 user 를 리턴한다. → 커스텀 데코레이터는 밸류를 리턴

---

1. header 에 token 을 보내준다.
2. 토큰을 decrypt, verify 하는 미들웨어를 거친다.
3. request object 에 user 를 추가 (req['user'])
4. request object 가 graphQL context 안으로 들어가게 된다.
5. guard 가 graphQL context 를 찾는다.
6. user 가 있는지 없는지에 따라 true, false 를 리턴
7. guard 에 의해 request 가 authorize 된다.
8. resolver 에 커스텀 데코레이터를 사용하여 graphQL context 에서 user 를 찾아서 return