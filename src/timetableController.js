var errorMessage = require("./errorMessage");
var request = require("request");
var memo = require("./memoController");

// timetable GET 요청
module.exports.GET = function(dynamo, queryparam, callback) {
  //GET 메소드
  if (queryparam !== null) {
    if ("user_key" in queryparam) {
      if (queryparam["user_key"] !== "") {
        //강의 코드 조회
        getLectureCode(dynamo, queryparam, callback);
      } else callback(null, {
        'statusCode': 400,
        'body': errorMessage("/programmers/timetable", "GET", "user_key 요청 변수가 비어 있어 시간표를 조회 할 수 없습니다.")
      });
    } else callback(null, {
      'statusCode': 400,
      'body': errorMessage("/programmers/timetable", "GET", "user_key 외에 다른 변수를 요청했습니다.")
    });
  } else callback(null, {
    'statusCode': 400,
    'body': errorMessage("/programmers/timetable", "GET", "user_key 요청 변수가 없어 시간표를 조회 할 수 없습니다.")
  });
};
// timetable POST 요청
// 함수로 다 뺄것
module.exports.POST = function(dynamo, postbody, callback) {
  var token_validation = false;
  //validation
  if (postbody !== null) {
    if ("user_key" in postbody && "code" in postbody) {
      //user_key 값이 존재할 때
      if (postbody["user_key"] != "") {
        const options = {
          uri: "https://www.programmers.co.kr/api/assignment_api/check_if_valid_token",
          qs: {
            token: postbody["user_key"]
          }
        };
        // 사용자 ID 토큰 valid 요청
        request(options, function(err, response, body) {
          //callback
          body = JSON.parse(body);
          token_validation = body["valid"];
          // 토큰이 검증 되었으면
          if (token_validation) {
            // 강의 중복검사 & 강의 코드 추가
            validateAllParameter(dynamo, postbody, callback);
          }
          // token이 유효하지 않을 때
          else {
            callback(null, {
              'statusCode': 403,
              'body': errorMessage("/programmers/timetable", "POST", "유효한 사용자 ID 토큰이 아닙니다. 정확한 프로그래머스 사용자 ID 토큰을 요청해주세요.")
            });
          }
        });
      } else callback(null, {
        'statusCode': 400,
        'body': errorMessage("/programmers/timetable", "POST", "user_key 요청 변수가 비어 있어 데이터를 삽입 할 수 없습니다.")
      });
    }
    // user_key & code가 존재하는지 여부
    else if ("user_key" in postbody && !("code" in postbody)) callback(null, {
      'statusCode': 400,
      'body': errorMessage("/programmers/timetable", "POST", "code 요청 변수가 없어 데이터를 삽입 할 수 없습니다.")
    });
    else if (!("user_key" in postbody) && "code" in postbody) callback(null, {
      'statusCode': 400,
      'body': errorMessage("/programmers/timetable", "POST", "user_key 요청 변수가 없어 데이터를 삽입 할 수 없습니다.")
    });
  } else callback(null, {
    'statusCode': 400,
    'body': errorMessage("/programmers/timetable", "POST", "user_key, code 요청 변수가 없어 데이터를 삽입 할 수 없습니다.")
  });
}

// timetable DELETE 요청
module.exports.DELETE = function(dynamo, postbody, callback) {
  //validation
  if (postbody !== null) {
    if ("user_key" in postbody && "code" in postbody) {
      //삭제 작업
      deleteTimetable(dynamo, postbody, callback);
    } else if ("user_key" in postbody && !("code" in postbody)) callback(null, {
      'statusCode': 400,
      'body': errorMessage("/programmers/timetable", "DELETE", "code 요청 변수가 없어 데이터를 삭제 할 수 없습니다.")
    });
    else if (!("user_key" in postbody) && "code" in postbody) callback(null, {
      'statusCode': 400,
      'body': errorMessage("/programmers/timetable", "DELETE", "user_key 요청 변수가 없어 데이터를 삭제 할 수 없습니다.")
    });
  } else callback(null, {
    'statusCode': 400,
    'body': errorMessage("/programmers/timetable", "DELETE", "user_key, code 요청 변수가 없어 데이터를 삭제 할 수 없습니다.")
  });
}

//강의 코드 조회 - GET
function getLectureCode(dynamo, queryparam, callback) {
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
}

//강의 코드 추가 - POST
function insertTimetable(dynamo, postbody, callback) {

    var params = {
      TableName: 'programmers_timetable',
      Item: {
        "user_key": postbody["user_key"],
        "lecture_code": postbody["code"]
      }
    };

    var text = "";
    var status = 200;

    dynamo.put(params, (err, data) => {
      if (err) {
        text = JSON.stringify({
          "message": "강의 코드 추가 에러 : " + err
        });
        status = 422;
      } else text = JSON.stringify({
        "message": postbody["code"] + " 강의 코드 추가 성공 !"
      });

      callback(null, {
        'statusCode': status,
        'headers': {},
        'body': text
      });
    });
}

// 파라미터 중복 검사 - POST
function validateAllParameter(dynamo, postbody, callback) {

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
    if (data["Count"] !== 0) insertState = false;
    // 중복 검사
    if (insertState) {
      // 강의 코드 validation
      if (validateLectureCode(postbody["code"], "POST", callback)) {
        //강의 코드 추가 작업
        insertTimetable(dynamo, postbody, callback);
      }
    } else callback(null, {
      'statusCode': 409,
      'body': errorMessage("/programmers/timetable", "POST", "이미 등록한 강의입니다.")
    });
  });
}

// lecture_code 파라미터 검증 - GET, POST
function validateLectureCode(lecture_code, method, callback) {
  // 강의코드 validation
  var re = new RegExp("PG1807-[0-9]{2}$");
  var result = re.test(lecture_code);
  if (!result) {
    //lecture_code 검증 실패
    callback(null, {
      'statusCode': 400,
      'body': errorMessage("/programmers/timetable", method, "code는 'PG1807-??' 형태이어야 합니다.")
    });
    return false;
  } else {
    //code 검증 완료
    return true;
  }
}

// 시간표 삭제 (강의 코드 삭제) - DELETE
function deleteTimetable(dynamo, postbody, callback){
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
  var status = 200;
  dynamo.delete(params, (err, data) => {
    if (err) {
      text = JSON.stringify({
        "message": "강의 코드 삭제 에러 : " + err
      });
      status = 422;
    } else text = JSON.stringify({
      "message": postbody["code"] + " 강의 코드 삭제 성공 !"
    });
    callback(null, {
      'statusCode': status,
      'headers': {},
      'body': text
    });
  });
}

// // 연쇄적으로 메모 삭제
// function cascadeMemo(dynamo, postbody, callback){
//     // parammeter 검증
//     if (validateLectureCode(postbody["code"], "DELETE", callback)) {
//       var params = {
//         TableName: 'programmers_memo',
//         KeyConditionExpression: "user_key = :key and (begins_with(lecture_code_type, :code))",
//         ExpressionAttributeValues: {
//           ":key": postbody["user_key"],
//           ":code": postbody["code"]
//         }
//       }
//       dynamo.query(params, (err, data) => {
//         if (data !== "" && data !== null) {
//           // code, type combine 형태 분리
//           var splitData = splitCodeandType(data);
//           var parsingData = splitData["Items"];
//           // 개수 세고 연속적으로 다 지움
//           for(var i=0;i<parsingData.length;i++){
//             tempbody = {};
//             tempbody["user_key"] = postbody["user_key"];
//             tempbody["code"] = postbody["code"];
//             tempbody["type"] = parsingData[i]["type"];
//             memo.DELETE(dynamo, tempbody, callback, "timetable");
//           }
//           // deleteTimetable(dynamo, postbody, callback);
//         }
//       });
//     }
// }
//
// // code, type combine 형태 분리 -> PG1807-01,TEST -> [PG1807-01,TEST]
// function splitCodeandType(data) {
//   items = data["Items"]
//   // 분리 작업
//   for (var i = 0; i < items.length; i++) {
//     lecture_code_type = items[i]["lecture_code_type"];
//     //삭제
//     delete items[i]["lecture_code_type"];
//     // 분리 후 따로 저장
//     temp = lecture_code_type.split(",");
//     items[i]["lecture_code"] = temp[0];
//     items[i]["type"] = temp[1];
//   }
//   return data;
// }
