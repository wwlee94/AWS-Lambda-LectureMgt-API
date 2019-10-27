var errorMessage = require("./errorMessage");
var request = require("request");

//memo GET 요청
//상세 일정 가져오기
module.exports.GET = function(dynamo, queryparam, callback) {

  if (queryparam !== null) {
    // user_key, code, type이 모두 존재할 때
    if ("user_key" in queryparam && "code" in queryparam) {
      if (queryparam["user_key"] !== "" && queryparam["code"] !== "") {
        // user_key가 가지는 code 강의의 상세일정 가져오기
        getDetailedMemo(dynamo, queryparam, callback);
      } else {
        callback(null, {
          'statusCode': 400,
          'body': errorMessage("/programmers/memo", "GET", "user_key 또는 code 요청 변수가 비어 있어 상세 일정을 조회할 수 없습니다.")
        });
      }
    }
    // user_key만 있을 경우
    else if ("user_key" in queryparam && !("code" in queryparam)) {
      if (queryparam["user_key"] !== "") {
        // user_key에 해당되는 상세일정 모두 가져오기
        getAllDetailedMemo(dynamo, queryparam, callback);
      } else {
        callback(null, {
          'statusCode': 400,
          'body': errorMessage("/programmers/memo", "GET", "user_key 요청 변수가 비어 있어 상세 일정을 조회할 수 없습니다.")
        });
      }
    }
    // code만 있을 경우
    else if (!("user_key" in queryparam) && "code" in queryparam)
      callback(null, {
        'statusCode': 400,
        'body': errorMessage("/programmers/memo", "GET", "user_key 요청 변수가 없어 상세 일정을 조회할 수 없습니다.")
      });
    // 다른 요청 변수를 요청했을 경우
    else
      callback(null, {
        'statusCode': 400,
        'body': errorMessage("/programmers/memo", "GET", "user_key, code 외에 다른 변수를 요청했습니다.")
      });
  }
  // 요청변수가 null
  else {
    callback(null, {
      'statusCode': 400,
      'body': errorMessage("/programmers/memo", "GET", "user_key, code 요청 변수가 없어 상세 일정을 조회할 수 없습니다.")
    });
  }
}

// memo POST 요청
// 상세 일정 추가하기
module.exports.POST = function(dynamo, postbody, callback) {
  //validation
  if (postbody !== null) {
    if ("user_key" in postbody && "code" in postbody && "type" in postbody &&
      "title" in postbody && "description" in postbody && "date" in postbody) {
      // 값이 공백이 아닐 때
      if (postbody["user_key"] !== "" && postbody["code"] !== "" && postbody["type"] !== "" &&
        postbody["title"] !== "" && postbody["description"] !== "" && postbody["date"] !== "") {
        //검증 후 데이터 추가
        validateUserKey(dynamo, postbody, callback);
      } else callback(null, {
        'statusCode': 400,
        'body': errorMessage("/programmers/memo", "POST", "요청 변수는 공백일 수 없습니다.")
      });
    } else callback(null, {
      'statusCode': 400,
      'body': errorMessage("/programmers/memo", "POST", "필수 변수를 모두 요청해주세요.")
    });
  } else callback(null, {
    'statusCode': 400,
    'body': errorMessage("/programmers/memo", "POST", "요청 변수가 없습니다.")
  });
}

// memo DELETE 요청
// 상세 일정 삭제
module.exports.DELETE = function(dynamo, postbody, callback) {
  //validation
  if (postbody !== null) {
    if ("user_key" in postbody && "code" in postbody && "type" in postbody) {

      if(postbody["user_key"] !== "" && postbody["code"] !== "" && postbody["type"] !== ""){

        if(validateLectureCode(postbody, "DELETE", callback)){
          if(validateType(postbody, "DELETE", callback)){
              // 검증 완료후 작업
              var lecture_code_type = postbody["code"] + "," + postbody["type"];
              var params = {
                TableName: 'programmers_memo',
                Key: {
                  "user_key": postbody["user_key"],
                  "lecture_code_type" : lecture_code_type
                },
                ConditionExpression: "user_key = :key and lecture_code_type = :code",
                ExpressionAttributeValues: {
                  ":key": postbody["user_key"],
                  ":code": lecture_code_type
                }
              }
              var text = "";
              var status = 200;
              dynamo.delete(params, (err, data) => {
                if (err) {
                  text = JSON.stringify({
                    "type": postbody["type"],
                    "lecture_code": postbody["code"],
                    "message": "메모 삭제 에러 : " + err
                  });
                  status = 422;
                } else text = JSON.stringify({
                  "type": postbody["type"],
                  "lecture_code": postbody["code"],
                  "message": "메모 삭제 성공 !"
                });
                callback(null, {
                  'statusCode': status,
                  'headers': {},
                  'body': text
                });
              });
          }
        }
      } else callback(null, {
        'statusCode': 400,
        'body': errorMessage("/programmers/memo", "DELETE", "요청 변수는 공백일 수 없습니다.")
      });
    } else callback(null, {
      'statusCode': 400,
      'body': errorMessage("/programmers/memo", "DELETE", "필수 변수를 모두 요청해주세요.")
    });
  } else callback(null, {
    'statusCode': 400,
    'body': errorMessage("/programmers/memo", "DELETE", "요청 변수가 없습니다.")
  });
}

// 특정 강의의 상세 일정 조회 -> 요청 변수 : user_key & code로 요청시
function getDetailedMemo(dynamo, queryparam, callback) {
  // parammeter 검증
  if (validateLectureCode(queryparam, "GET", callback)) {
    var params = {
      TableName: 'programmers_memo',
      KeyConditionExpression: "user_key = :key and (begins_with(lecture_code_type, :code))",
      ExpressionAttributeValues: {
        ":key": queryparam["user_key"],
        ":code": queryparam["code"]
      }
    }
    dynamo.query(params, (err, data) => {
      if (data !== "" && data !== null) {
        // code, type combine 형태 분리
        parsingData = splitCodeandType(data);

        callback(null, {
          'statusCode': 200,
          'headers': {},
          'body': JSON.stringify(parsingData)
        });
      }
    });
  } else {
    callback(null, {
      'statusCode': 422,
      'body': errorMessage("/programmers/memo", "GET", "code 요청 변수는 TEST, STUDY, HOMEWORK 중 하나입니다.")
    });
  }
}

// 모든 상세 일정 조회 -> 요청 변수: user_key로만 요청시
function getAllDetailedMemo(dynamo, queryparam, callback) {

  var params = {
    TableName: 'programmers_memo',
    KeyConditionExpression: "user_key = :key",
    ExpressionAttributeValues: {
      ":key": queryparam["user_key"]
    }
  }
  dynamo.query(params, (err, data) => {
    if (data !== "" && data !== null) {
      // code, type combine 형태 분리
      parsingData = splitCodeandType(data);

      // response
      callback(null, {
        'statusCode': 200,
        'headers': {},
        'body': JSON.stringify(parsingData)
      });
    }
  });
}

// code, type combine 형태 분리 -> PG1807-01,TEST -> [PG1807-01,TEST]
function splitCodeandType(data) {
  items = data["Items"]
  // 분리 작업
  for (var i = 0; i < items.length; i++) {
    lecture_code_type = items[i]["lecture_code_type"];
    //삭제
    delete items[i]["lecture_code_type"];
    // 분리 후 따로 저장
    temp = lecture_code_type.split(",");
    items[i]["lecture_code"] = temp[0];
    items[i]["type"] = temp[1];
  }
  return data;
}

// 데이터 추가시 user_key + 파라미터 검증
function validateUserKey(dynamo, postbody, callback) {
  //user_key 검증
  var token_validation = false;
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
    // user_key 토큰이 검증 되었으면
    if (token_validation) {
      // code가 검증 되었으면
      if (validateLectureCode(postbody, "POST", callback)) {
        // type이 검증 되었으면
        if (validateType(postbody, "POST", callback)) {
          // date validation
          if (validateDate(postbody, "POST", callback)) {
            // 모든 검증이 끝났으면 추가 작업!
            //시간표 검증
            validateMemo(dynamo, postbody, callback);
          }
        }
      }
    }
    // token이 유효하지 않을 때
    else
      callback(null, {
        'statusCode': 403,
        'body': errorMessage("/programmers/memo", "POST", "유효한 사용자 ID 토큰이 아닙니다. 정확한 프로그래머스 사용자 ID 토큰을 요청해주세요.")
      });

  });
}

// 캘린더에 중복된 lecture_code와 type이 있는지 검사
function validateMemo(dynamo, postbody, callback){

  var lecture_code_type = postbody["code"] + "," + postbody["type"];

  var params = {
    TableName: 'programmers_memo',
    KeyConditionExpression: "user_key = :key and lecture_code_type = :code_type",
    ExpressionAttributeValues: {
      ":key": postbody["user_key"],
      ":code_type": lecture_code_type
    }
  };

  dynamo.query(params, (err, data) => {
    // 중복 검사 -> 추가 안되어있으면 다음 스텝!
    if (data["Count"] === 0) {
        validateTimetable(dynamo, postbody, callback);
    } else callback(null, {
      'statusCode': 409,
      'body': errorMessage("/programmers/memo", "POST", postbody["code"]+" 강의에서 이미 등록한 메모 타입입니다.")
    });
  });

}

// 시간표에 등록된 강의인지 검사! 등록 안되어 있으면 메모 추가 불가 + 나머지
function validateTimetable(dynamo, postbody, callback) {
  var params = {
    TableName: 'programmers_timetable',
    KeyConditionExpression: "user_key = :key and lecture_code = :code",
    ExpressionAttributeValues: {
      ":key": postbody["user_key"],
      ":code": postbody["code"]
    }
  };
  dynamo.query(params, (err, data) => {
    // 추가된 강의인지  검증
    if (data["Count"] !== 0) {
      insertMemo(dynamo, postbody, callback);
    } else callback(null, {
      'statusCode': 409,
      'body': errorMessage("/programmers/memo", "POST", "시간표에 등록된 강의가 아니기 때문에 메모를 추가 할 수 없습니다.")
    });
  });
}

// lecture_code 파라미터 검증 - GET, POST
function validateLectureCode(param, method, callback) {
  var lecture_code = param["code"];
  // 강의코드 validation
  var re = new RegExp("PG1807-[0-9]{2}$");
  var result = re.test(lecture_code);
  if (!result) {
    //lecture_code 검증 실패
    callback(null, {
      'statusCode': 422,
      'body': errorMessage("/programmers/memo", method, "code는 'PG1807-??' 형태이어야 합니다.")
    });
    return false;
  } else {
    //code 형태 검증 완료
    return true;
  }
}

//type 파라미터 검증 - POST
function validateType(param, method, callback) {
  var type = param["type"];
  // 시험, 스터디, 과제
  if (type === "EXAM" || type === "STUDY" || type === "HOMEWORK") return true;
  else {
    //type 검증 실패
    callback(null, {
      'statusCode': 422,
      'body': errorMessage("/programmers/memo", method, "type은 'EXAM','STUDY','HOMEWORK' 중 하나의 형태이어야 합니다.")
    });
    return false;
  }
}

//date 파라미터 검증 - post
function validateDate(param, method, callback) {
  var date = param["date"];
  // 날짜 validation - yyyy-MM-dd
  var re = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}$");
  var result = re.test(date);
  if (!result) {
    //lecture_code 검증 실패
    callback(null, {
      'statusCode': 422,
      'body': errorMessage("/programmers/memo", method, "date는 'yyyy-MM-dd' 형태이어야 합니다.")
    });
    return false;
  } else {
    //date 검증 완료
    return true;
  }
}

//메모 추가 - user_key, code, type, title, description, date
function insertMemo(dynamo, postbody, callback) {

  // code, type combine : delimiter= ','
  // noSQL이라 컴바인해서 사용
  var lecture_code_type = postbody["code"] + "," + postbody["type"];

  var params = {
    TableName: 'programmers_memo',
    Item: {
      "user_key": postbody["user_key"],
      "lecture_code_type": lecture_code_type,
      "title": postbody["title"],
      "description": postbody["description"],
      "date": postbody["date"]
    }
  };

  var text = "";
  var status = 200;

  dynamo.put(params, (err, data) => {
    if (err) {
      text = JSON.stringify({
        "type": postbody["type"],
        "lecture_code": postbody["code"],
        "title": postbody["title"],
        "message": "메모 추가 에러 : " + err
      });
      status = 422;
    } else text = JSON.stringify({
      "type": postbody["type"],
      "lecture_code": postbody["code"],
      "title": postbody["title"],
      "message": "메모 추가 성공 !"
    });

    callback(null, {
      'statusCode': status,
      'headers': {},
      'body': text
    });
  });
}

// 모든 공백 제거
function delBlank(string) {
  return string.replace("/(\s*)/g", "");
}
