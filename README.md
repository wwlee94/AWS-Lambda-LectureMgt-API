# AWS_Lambda_LectureMgt_API
AWS Lambda를 사용한 강좌관리 serverless API

## 강좌 API URL
- https://k03c8j1o5a.execute-api.ap-northeast-2.amazonaws.com/v1/programmers/lecture

### 1. 강좌 API - GET 메소드 요청 (QueryParameter)
- 강좌의 목록을 조회할 수 있는 API 
- code -> 강좌 코드
- lecture -> 강좌 이름

### 1-1. 강좌 GET API - 요청 별 ResponseBody 정보
- 요청 변수 없을 시 -> 강좌의 전체 목록 반환
- code 요청 변수로 API 요청 시 -> code와 일치하는 강좌 코드를 조회해 해당 강좌 정보를 반환
- lecture 요청 변수로 API 요청 시 -> lecture로 시작하는 강좌명을 모두 반환 (검색 기능)

## 시간표 API URL
- https://k03c8j1o5a.execute-api.ap-northeast-2.amazonaws.com/v1/programmers/timetable

### 1. 시간표 API - GET 메소드 요청 (QueryParameter)
- 사용자가 추가한 모든 강좌의 코드를 조회할 수 있는 API
- user_key -> 사용자 ID 토큰

### 1-1. 시간표 GET API - 요청 별 ResponseBody 정보
- 요청 변수 없을 시 -> 조회 불가
- user_key 요청 변수로 API 요청 시 -> user_key로 등록 했던 강좌코드를 모두 반환

### 2. 시간표 API - POST, DELETE 메소드 요청 (RequestBody)
- 사용자가 원하는 강좌를 추가하거나 삭제 할 수 있는 API
- JSON 으로 RequestBody 요청<br>
  {<br>
   &nbsp;&nbsp;&nbsp;&nbsp;"user_key" : "{사용자 ID 토큰}",<br>
   &nbsp;&nbsp;&nbsp;&nbsp;"code" : "{강좌 코드}"<br>
  }
  
### 2-1. 시간표 POST, DELETE API - 요청 별 ResponseBody 정보
- 요청 변수 없을 시 -> 추가, 삭제 불가
- user_key, code 두가지 함께 API 요청해야 데이터 추가, 삭제 가능

## 접근 토큰 키 (x-api-key)
- QJuHAX8evMY24jvpHfHQ4pHGetlk5vn8FJbk70O6

## 개발 과정
- 개발은 AWS DynamoDB, AWS Lambda, AWS API Gateway, AWS S3를 사용하여 개발
1. 강좌 데이터는 목록을 csv파일로 만들어 S3 버킷에 csv을 올린 뒤 Lambda 함수로 버킷에 있는 데이터를 로드해 DynamoDB 테이블에 데이터 저장
2. API Gateway는 Lambda-proxy 타입으로 생성 - URL Method 별로 Lambda 함수를 분리하지 않고 하나의 파일로 통합 관리 하도록
3. 요청이 들어온 resource 별로, httpmethod 별로 각각 조건을 나누어 요청이 들어오면 해당 조건에 맞는 이벤트를 처리
4. aws-sdk로 DynamoDB 연동 후 조회, 추가, 삭제 기능을 구현
