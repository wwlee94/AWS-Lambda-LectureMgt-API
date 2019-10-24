# 프로그래머스 윈터 코딩 앱 개발 과제 - 강의 관리 API
강의 목록을 조회할 수 있고 각 사용자별로 추가한 강의를 조회, 저장, 삭제 해주는 API

# API REFERENCE

### BASE URL
- https://k03c8j1o5a.execute-api.ap-northeast-2.amazonaws.com/v1/programmers

### API 접근 키 (x-api-key)
- QJuHAX8evMY24jvpHfHQ4pHGetlk5vn8FJbk70O6

## Lectures API (강의 정보 API)
강의 목록을 조회 할 수 있는 API
```
GET /lectures -> 전체 강의 목록을 반환합니다.

GET /lectures?code={강의코드} -> code 값과 동일한 강의 정보가 반환됩니다.

GET /lectures?lecture={강의이름} -> lecture로 시작하는 과목명을 모두 반환합니다. (대소문자 구분)
```

### Lectures 구조
| code      | lecture              | professor   | starttime | endtime | dayofweek |
|-----------|----------------------|-------------|-----------|---------|-----------|
| GE1807-01 | World Wide English 1 | Caitlyn Lee | 10:30     | 12:30   | 월금      |
| ..        | ..                   | ..          | ..        | ..      | ..        |

테이블은 NoSQL DB인 AWS DynamoDB로 설계
- Partition key -> code

#### 컬럼 설명
- code -> 강의 코드
- lecture -> 강의 이름
- professor -> 교수 이름
- starttime -> 강의 시작 시간
- endtime -> 강의 종료 시간
- dayofweek -> 강의 요일

### Lectures API 요청 - GET 메소드
강의 목록을 조회 할 수 있는 메소드

#### Request Header 구조
```
GET /lectures
x-api-key: {x-api-key}
Content-Type: application/json
```
| Header      | Description                      |
|-----------|----------------------------------|
| x-api-key | 강의 관리 API를 이용하기 위한 key |

#### QueryParameter (선택)

| Parameter | Type   | Description |
|----------------|--------|-------------|
| code           | String | 강의 코드   |
| lecture        | String | 강의 이름   |

#### 요청 예시 - cURL
```
curl -G https://k03c8j1o5a.execute-api.ap-northeast-2.amazonaws.com/v1/programmers/lectures -H "x-api-key : QJuHAX8evMY24jvpHfHQ4pHGetlk5vn8FJbk70O6" -H "Content-Type: application/json"
```
#### Response
| Status Code               | Description                                       |
|---------------------------|---------------------------------------------------|
| 200 OK                    | 성공                                              |
| 400 Bad Request           | 클라이언트 요청 오류 - code, lecture가 빈값일 때  |
| 403 Forbidden             | x-api-key 인증 에러                               |
| 403 Forbidden             | URL 경로, HTTP method 오류                        |
| 500 Internal Server Error | 서버에 문제가 있을 경우                           |

## TimeTable API (사용자별 강의 코드 API)
사용자별로 추가한 강의를 조회, 추가, 삭제 할 수 있는 API

```
GET /timetable?user_key={사용자 ID 토큰} -> user_key로 등록 했던 강의 코드를 모두 반환

POST /timetable -> 사용자가 새로운 강의 코드를 추가합니다.

DELETE /timetable -> 사용자의 추가된 강의 코드를 삭제합니다.
```

### Timetable 구조
| user_key    | lecture_code |
|-------------|--------------|
| {user_id_token} | GE1807-01    |
| {user_id_token} | GE1807-15    |
| ..          | ..           |

테이블은 NoSQL DB인 AWS DynamoDB로 설계
- Partition key -> user_key
- Sort key -> lecture_code

#### 컬럼 설명
- user_key -> 사용자 ID 토큰 (프로그래머스에서 지급 받은 토큰)
- lecture_code -> 강의 코드

### Timetable API 요청 - GET 메소드
사용자별로 추가한 강의 코드를 모두 조회할 수 있는 메소드
- 요청 변수 없을 시 -> 추가, 삭제 불가

#### Request Header 구조
```
GET /timetable
x-api-key: {x-api-key}
Content-Type: application/json
```
| Header      | Description                      |
|-----------|----------------------------------|
| x-api-key | 강의 관리 API를 이용하기 위한 key |

#### QueryParameter (필수)

| Parameter | Type   | Description |
|----------------|--------|-------------|
| user_key           | String | 사용자 ID 토큰 (프로그래머스에서 지급 받은 토큰)   |

#### 요청 예시 - cURL
```
curl -G https://k03c8j1o5a.execute-api.ap-northeast-2.amazonaws.com/v1/programmers/timetable?user_key=token_key_grepp -H "x-api-key : QJuHAX8evMY24jvpHfHQ4pHGetlk5vn8FJbk70O6" -H "Content-Type: application/json"
```

#### Response
| Status Code               | Description                                       |
|---------------------------|---------------------------------------------------|
| 200 OK                    | 성공                                              |
| 400 Bad Request           | 클라이언트 요청 오류 - user_key가 없거나 빈값일 때  |
| 403 Forbidden             | x-api-key 인증 에러                               |
| 403 Forbidden             | URL 경로, HTTP method 오류                        |
| 500 Internal Server Error | 서버에 문제가 있을 경우                           |

### Timetable API 요청 - POST, DELETE 메소드
사용자별로 원하는 강의 코드를 추가, 삭제 할 수 있는 메소드
- 요청 변수 없을 시 -> 추가, 삭제 불가
- user_key, code 두가지 함께 API 요청해야 데이터 추가, 삭제 가능

#### Request Header 구조
```
POST /timetable
x-api-key: {x-api-key}
Content-Type: application/json
```

```
DELETE /timetable
x-api-key: {x-api-key}
Content-Type: application/json
```

| Header      | Description                      |
|-----------|----------------------------------|
| x-api-key | 강의 관리 API를 이용하기 위한 key |

#### RequestBody 요청 예시 (필수)
```
{
  "user_key":"{user_id_token}",
  "code" : "GE1807-01"
}
```

| Parameter | Type   | Description |
|----------------|--------|-------------|
| user_key    | String | 사용자 ID 토큰 (프로그래머스에서 지급 받은 토큰)   |
| code       | String | 강의 코드   |

#### 요청 예시 - cURL
##### POST 추가 예시
```
curl -X POST -d "{\"user_key\":\"token_key_grepp\",\"code\":\"GE1807-12\"}" https://k03c8j1o5a.execute-api.ap-northeast-2.amazonaws.com/v1/programmers/timetable -H "x-api-key : QJuHAX8evMY24jvpHfHQ4pHGetlk5vn8FJbk70O6" -H "Content-Type: application/json"
```
##### DELETE 삭제 예시
```
curl -X DELETE -d "{\"user_key\":\"token_key_grepp\",\"code\":\"GE1807-12\"}" https://k03c8j1o5a.execute-api.ap-northeast-2.amazonaws.com/v1/programmers/timetable -H "x-api-key : QJuHAX8evMY24jvpHfHQ4pHGetlk5vn8FJbk70O6" -H "Content-Type: application/json"
```

#### Response
| Status Code               | Description                                       |
|---------------------------|---------------------------------------------------|
| 200 OK                    | 성공                                              |
| 400 Bad Request           | 클라이언트 요청 오류 - user_key, code가 없거나 빈값일때|
| 403 Forbidden             | x-api-key 인증 에러                               |
| 403 Forbidden             | URL 경로, HTTP method 오류                        |
| 403 Forbidden             | 데이터 추가시 유효하지 않은 사용자 ID 토큰일 떄      |
| 409 Conflict              | 데이터 추가시 이미 있는 데이터가 존재할 때(중복)     |
| 422 Unprocessable Entity  | 데이터 삭제시 없는 데이터를 삭제하려 할 때          |
| 500 Internal Server Error | 서버에 문제가 있을 경우                           |

## 주의 사항
#### cURL 한글 깨짐 현상
windows의 콘솔창은 기본 cp949 형식이며, utf-8 인코딩의 한글은 출력할 시에 깨지게 됩니다.
아래를 통해 한글 깨짐을 방지할 수 있습니다.
1. 콘솔창을 호출하여 우클릭 > 속성 을 호출합니다.
2. 글꼴탭에서 글꼴을 굴림체로 변경합니다.
    > ※ 굴림체로 변경안하고 utf-8로 변경시 글꼴이 엄청 작아집니다.
3. 커맨드라인에 아래와 같이 입력합니다. ( utf-8(65001)로 변경 )
    > chcp 65001
4. 한글 결과가 나오는 rest url을 호출하면 정상적으로 호출되는 것을 확인하실 수 있습니다.

#### cURL queryparam 요청시
* Lectures API cURL요청시 https://www.url-encode-decode.com/ 에서 한글만 인코딩 후 요청해야 잘 출력됩니다.
    > ex) 논리 -> %EB%85%BC%EB%A6%AC

## 개발 루트
- 개발은 AWS DynamoDB, AWS Lambda, AWS API Gateway, AWS S3를 사용하여 개발
1. 강좌 데이터는 목록을 csv파일로 만들어 S3 버킷에 csv을 올린 뒤 Lambda 함수로 버킷에 있는 데이터를 로드해 DynamoDB 테이블에 데이터 저장
2. API Gateway는 Lambda-proxy 타입으로 생성 - URL Method 별로 Lambda 함수를 분리하지 않고 하나의 Lambda 함수로 통합 관리 하도록
3. 요청이 들어온 resource 별로, httpmethod 별로 각각 조건을 나누어 요청이 들어오면 해당 조건에 맞는 이벤트를 처리
4. aws-sdk로 DynamoDB 연동 후 조회(query, scan), 추가(put), 삭제(delete) 기능을 구현
