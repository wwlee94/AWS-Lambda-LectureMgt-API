// const doc = require('dynamodb-doc');
// const dynamo = new doc.DynamoDB();
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

//강좌 테이블 컨트롤러
function lectureController(dynamo, operation, queryparam, callback) {
  if (operation == 'GET') {
    if (queryparam != null) {
      // code, lecture key는 있지만 값은 비어있으면
      if ("code" in queryparam && "lecture" in queryparam) {
        if (queryparam["code"] == "" && queryparam["lecture"] == "") {
          callback(null, {
            'body': errorMessage("/programmers/lecture", "GET", "code, lecture 요청 변수가 비어 있어 조회 할 수 없습니다.")
          });
        }
      }
      // code 값이 있으면
      if ("code" in queryparam) {
        if (queryparam["code"] != "") { // 빈값이 아닐때
          console.log("search code by " + queryparam["code"]);
          var params = {
            TableName: 'programmers_lecture',
            KeyConditionExpression: "code = :code",
            ExpressionAttributeValues: {
              ":code": queryparam["code"]
            }
          }
          dynamo.query(params, (err, data) => {
            callback(null, {
              'statusCode': 200,
              'headers': {},
              'body': JSON.stringify(data)
            });
          });
        } else callback(null, {
          'body': errorMessage("/programmers/lecture", "GET", "code 요청 변수가 비어 있어 조회 할 수 없습니다.")
        });
      }
      // lecture 값이 있으면
      else if ("lecture" in queryparam) {
        if (queryparam["lecture"] != "") { // 빈값이 아닐때
          console.log("search lecture")
          var params = {
            TableName: 'programmers_lecture',
            FilterExpression: "(begins_with(lecture, :lec))",
            ExpressionAttributeValues: {
              ":lec": queryparam["lecture"]
            }
          }
          dynamo.scan(params, (err, data) => {
            callback(null, {
              'statusCode': 200,
              'headers': {},
              'body': JSON.stringify(data)
            });
          });
        } else callback(null, {
          'body': errorMessage("/programmers/lecture", "GET", "lecture 요청 변수가 비어 있어 조회 할 수 없습니다.")
        });
      }
    } else {
      console.log("search all lecture")
      // 요청 변수 없을 때 전체 검색 결과 반환
      var params = {
        TableName: 'programmers_lecture'
        // ,ScanIndexForward: false
      }
      dynamo.scan(params, (err, data) => {
        callback(null, {
          'statusCode': 200,
          'headers': {},
          'body': JSON.stringify(data)
        });
      });
    }
  }
}

//시간표 컨트롤러
function timetableController(dynamo, operation, queryparam, postbody, callback) {
  switch (operation) {
    case 'GET':
      if (queryparam != null) {
        if ("user_key" in queryparam) {
          if (queryparam["user_key"] != "") {
            var params = {
              TableName: 'programmers_timetable',
              ProjectionExpression: "lecture_code", //보여줄 column
              KeyConditionExpression: "user_key = :key",
              ExpressionAttributeValues: {
                ":key": queryparam["user_key"]
              }
            }
            dynamo.query(params, (err, data) => {
              callback(null, {
                'statusCode': 200,
                'headers': {},
                'body': JSON.stringify(data)
              });
            });
          } else callback(null, {
            'body': errorMessage("/programmers/timetable", "GET", "user_key 요청 변수가 비어 있어 시간표를 조회 할 수 없습니다.")
          });
        }
      } else callback(null, {
        'body': errorMessage("/programmers/timetable", "GET", "user_key 요청 변수가 없어 시간표를 조회 할 수 없습니다.")
      });
      break;
    case 'POST':
      //validation
      if (postbody != null) {
        if ("user_key" in postbody && "code" in postbody) {
          //데이터 추가 작업
          console.log("insert timetable data");
          var params = {
            TableName: 'programmers_timetable',
            Item: {
              "user_key": postbody["user_key"],
              "lecture_code": postbody["code"]
            }
          }
          var text = "";
          dynamo.put(params, (err, data) => {
            if (err) text = JSON.stringify({
              "message": "데이터 삽입 에러 - " + err
            });
            else text = JSON.stringify({
              "message": "데이터 삽입 성공 !"
            });
            callback(null, {
              'statusCode': 200,
              'headers': {},
              'body': text
            });
          });
        } else if ("user_key" in postbody && !("code" in postbody)) callback(null, {
          'body': errorMessage("/programmers/timetable", "POST", "code 요청 변수가 없어 데이터를 삽입 할 수 없습니다.")
        });
        else if (!("user_key" in postbody) && "code" in postbody) callback(null, {
          'body': errorMessage("/programmers/timetable", "POST", "lecture 요청 변수가 없어 데이터를 삽입 할 수 없습니다.")
        });
      } else callback(null, {
        'body': errorMessage("/programmers/timetable", "POST", "code, lecture 요청 변수가 없어 데이터를 삽입 할 수 없습니다.")
      });
      break;
    case 'DELETE':
      //validation
      if (postbody != null) {
        if ("user_key" in postbody && "code" in postbody) {
          //데이터 추가 작업
          console.log("delete timetable data");
          var params = {
            TableName: 'programmers_timetable',
            Key: {
              "user_key": postbody["user_key"],
              "lecture_code": postbody["code"]
            },
            ConditionExpression: "user_key = :key and lecture_code = :code",
            ExpressionAttributeValues: {
              ":key": postbody["user_key"],
              ":code": postbody["code"]
            }
          }
          var text = "";
          dynamo.delete(params, (err, data) => {
            if (err) text = JSON.stringify({
              "message": "데이터 삭제 에러 - " + err
            });
            else text = JSON.stringify({
              "message": "데이터 삭제 성공 !"
            });
            callback(null, {
              'statusCode': 200,
              'headers': {},
              'body': text
            });
          });
        } else if ("user_key" in postbody && !("code" in postbody)) callback(null, {
          'body': errorMessage("/programmers/timetable", "DELETE", "code 요청 변수가 없어 데이터를 삽입 할 수 없습니다.")
        });
        else if (!("user_key" in postbody) && "code" in postbody) callback(null, {
          'body': errorMessage("/programmers/timetable", "DELETE", "user_key 요청 변수가 없어 데이터를 삽입 할 수 없습니다.")
        });
      } else callback(null, {
        'body': errorMessage("/programmers/timetable", "DELETE", "user_key, code 요청 변수가 없어 데이터를 삽입 할 수 없습니다.")
      });
      break;
    default:
      callback(new Error('Unrecognized operation'));
      break;
  }
}
// 에러 메시지
function errorMessage(resource, httpMethod, message) {
  const msg = {};
  msg["resource"] = resource;
  msg["httpMethod"] = httpMethod;
  msg["message"] = message;
  return JSON.stringify(msg)
}
module.exports.handler = (event, context, callback) => {
  // HTTP method
  const operation = event.httpMethod;
  // URL
  const resource = event.resource;
  // queryparam
  const queryparam = event.queryStringParameters;
  // post body
  const body = JSON.parse(event.body);

  // 강좌 테이블
  if (resource == "/programmers/lecture") {
    lectureController(dynamo, operation, queryparam, callback);
  }
  //시간표 테이블
  else if (resource == "/programmers/timetable") {
    timetableController(dynamo, operation, queryparam, body, callback);
  }
};
