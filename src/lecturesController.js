var errorMessage = require("./errorMessage");

module.exports.GET = function(dynamo, queryparam, callback){
    if (queryparam !== null) {
      // code, lecture key는 있지만 값은 비어있으면
      if ("code" in queryparam && "lecture" in queryparam) {
        if (queryparam["code"] === "" && queryparam["lecture"] === "") {
          callback(null, {
            'statusCode': 400,
            'body': errorMessage("/programmers/lectures", "GET", "code, lecture 요청 변수가 비어 있어 강좌를 조회 할 수 없습니다.")
          });
        }
      }
      // code 값이 있으면
      if ("code" in queryparam) {
        if (queryparam["code"] !== "") { // 빈값이 아닐때
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
          'statusCode': 400,
          'body': errorMessage("/programmers/lectures", "GET", "code 요청 변수가 비어 있어 강좌를 조회 할 수 없습니다.")
        });
      }
      // lecture 값이 있으면
      else if ("lecture" in queryparam) {
        if (queryparam["lecture"] !== "") { // 빈값이 아닐때
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
          'statusCode': 400,
          'body': errorMessage("/programmers/lectures", "GET", "lecture 요청 변수가 비어 있어 강좌를 조회 할 수 없습니다.")
        });
      }
    } else {
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
