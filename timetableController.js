var errorMessage = require("./errorMessage");

// timetable GET 요청
module.exports.GET = function(dynamo, queryparam, postbody, callback){
  //GET 메소드
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
          };
          dynamo.query(params, (err, data) => {
            callback(null, {
              'statusCode': 200,
              'headers': {},
              'body': JSON.stringify(data)
            });
          });
        } else callback(null, {
          'statucCode': 400,
          'body': errorMessage("/programmers/timetable", "GET", "user_key 요청 변수가 비어 있어 시간표를 조회 할 수 없습니다.")
        });
      }
    } else callback(null, {
      'statucCode': 400,
      'body': errorMessage("/programmers/timetable", "GET", "user_key 요청 변수가 없어 시간표를 조회 할 수 없습니다.")
    });

}
// timetable POST 요청
module.exports.POST = function(dynamo, queryparam, postbody, callback){
  //validation
  if (postbody != null) {
    if ("user_key" in postbody && "code" in postbody) {
      //데이터 중복 검사
      var params = {
        TableName: 'programmers_timetable',
        KeyConditionExpression: "user_key = :key and lecture_code = :code",
        ExpressionAttributeValues: {
          ":key": postbody["user_key"],
          ":code": postbody["code"]
        }
      };
      dynamo.query(params, (err, data) => {
        var insertState = true
        if (data["Count"] != 0) insertState = false;

        if (insertState) {
          //데이터 추가 작업
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
        } else callback(null, {
          'statucCode': 400,
          'body': errorMessage("/programmers/timetable", "POST", "중복되는 데이터가 존재합니다.")
        });
      });
    } else if ("user_key" in postbody && !("code" in postbody)) callback(null, {
      'statucCode': 400,
      'body': errorMessage("/programmers/timetable", "POST", "code 요청 변수가 없어 데이터를 삽입 할 수 없습니다.")
    });
    else if (!("user_key" in postbody) && "code" in postbody) callback(null, {
      'statucCode': 400,
      'body': errorMessage("/programmers/timetable", "POST", "lecture 요청 변수가 없어 데이터를 삽입 할 수 없습니다.")
    });
  } else callback(null, {
    'statucCode': 400,
    'body': errorMessage("/programmers/timetable", "POST", "code, lecture 요청 변수가 없어 데이터를 삽입 할 수 없습니다.")
  });
}

// timetable DELETE 요청
module.exports.DELETE = function(dynamo, queryparam, postbody, callback){
  //validation
  if (postbody != null) {
    if ("user_key" in postbody && "code" in postbody) {
      //데이터 추가 작업
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
      'statucCode': 400,
      'body': errorMessage("/programmers/timetable", "DELETE", "code 요청 변수가 없어 데이터를 삭제 할 수 없습니다.")
    });
    else if (!("user_key" in postbody) && "code" in postbody) callback(null, {
      'statucCode': 400,
      'body': errorMessage("/programmers/timetable", "DELETE", "user_key 요청 변수가 없어 데이터를 삭제 할 수 없습니다.")
    });
  } else callback(null, {
    'statucCode': 400,
    'body': errorMessage("/programmers/timetable", "DELETE", "user_key, code 요청 변수가 없어 데이터를 삭제 할 수 없습니다.")
  });

}
