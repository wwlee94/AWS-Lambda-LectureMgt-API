var errorMessage = require("./errorMessage");

//calendar GET 요청
//상세 일정 가져오기
module.exports.GET = function(dynamo, queryparam, callback) {

  if (queryparam !== null) {
    // user_key, code, type이 모두 존재할 때
    if ("user_key" in queryparam && "code" in queryparam) {
      if (queryparam["user_key"] !== "" && queryparam["code"] !== "") {
        // user_key가 가지는 code 강의의 상세일정 가져오기
        getDetailedCalendar(dynamo, queryparam, callback);
      } else {
        callback(null, {
          'statusCode': 400,
          'body': errorMessage("/programmers/calendar", "GET", "user_key 또는 code 요청 변수가 비어 있어 상세 일정을 조회할 수 없습니다.")
        });
      }
    }
    // user_key만 있을 경우
    else if ("user_key" in queryparam && !("code" in queryparam)) {
      if (queryparam["user_key"] !== "") {
        // user_key에 해당되는 상세일정 모두 가져오기
        getAllDetailedCalendar(dynamo, queryparam, callback);
      } else {
        callback(null, {
          'statusCode': 400,
          'body': errorMessage("/programmers/calendar", "GET", "user_key 요청 변수가 비어 있어 상세 일정을 조회할 수 없습니다.")
        });
      }
    }
    // code만 있을 경우
    else if (!("user_key" in queryparam) && "code" in queryparam)
      callback(null, {
        'statusCode': 400,
        'body': errorMessage("/programmers/calendar", "GET", "user_key 요청 변수가 없어 상세 일정을 조회할 수 없습니다.")
      });
    // 다른 요청 변수를 요청했을 경우
    else
      callback(null, {
        'statusCode': 400,
        'body': errorMessage("/programmers/calendar", "GET", "user_key, code 외에 다른 변수를 요청했습니다.")
      });
  }
  // 요청변수가 null
  else {
    callback(null, {
      'statusCode': 400,
      'body': errorMessage("/programmers/calendar", "GET", "user_key, code 요청 변수가 없어 상세 일정을 조회할 수 없습니다.")
    });
  }
}

// calendar POST 요청
// 상세 일정 추가하기
module.exports.POST = function(dynamo, postbody, callback) {
  callback(null, {
    'statusCode': 400,
    'body': errorMessage("/programmers/calendar", "POST", "POST 요청 성공 !!")
  });
}

// calendar DELETE 요청
// 상세 일정 삭제
module.exports.DELETE = function(dynamo, postbody, callback) {
  callback(null, {
    'statusCode': 400,
    'body': errorMessage("/programmers/calendar", "DELETE", "DELETE 요청 성공 !!")
  });
}

// 특정 강의의 상세 일정 조회 -> 요청 변수 : user_key & code로 요청시
function getDetailedCalendar(dynamo, queryparam, callback) {
  // parammeter 검증
  if (validateLectureCode(queryparam["code"]) === true) {
    var params = {
      TableName: 'programmers_calendar',
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
      'statusCode': 400,
      'body': errorMessage("/programmers/calendar", "GET", "code 요청 변수는 TEST, STUDY, HOMEWORK 중 하나입니다.")
    });
  }
}

// 모든 상세 일정 조회 -> 요청 변수: user_key로만 요청시
function getAllDetailedCalendar(dynamo, queryparam, callback) {

  // code, type combine : delimiter= ','
  // noSQL이라 컴바인해서 사용
  // var lecture_code_type = queryparam["code"] + "," + queryparam["type"];

  var params = {
    TableName: 'programmers_calendar',
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

// lecture_code 파라미터 검증
function validateLectureCode(lecture_code) {
  // 강의코드 validation
  var re = new RegExp("PG1807-[0-9]{2}$");
  var result = re.test(lecture_code);
  if (!result) {
    //lecture_code 검증 실패
    callback(null, {
      'statusCode': 400,
      'body': errorMessage("/programmers/calendar", "GET", "code는 'PG1807-??' 형태이어야 합니다.")
    });
    return false;
  } else {
    //lecture_code, type 검증 완료
    return true;
  }
}

//type 파라미터 검증
function validateType(type) {
  // 시험, 스터디, 과제
  if (type === "EXAM" || type === "STUDY" || type === "HOMEWORK") {
    return true;
  } else {
    //type 검증 실패
    callback(null, {
      'statusCode': 400,
      'body': errorMessage("/programmers/calendar", "GET", "type은 'EXAM','STUDY','HOMEWORK' 중 하나의 형태이어야 합니다.")
    });
    return false;
  }
}
