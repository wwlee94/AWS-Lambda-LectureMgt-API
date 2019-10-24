var errorMessage = require("./errorMessage");

//calendar GET 요청
//상세 일정 가져오기
module.exports.GET = function(dynamo, queryparam, postbody, callback){
  callback(null, {
    'statusCode': 400,
    'body': errorMessage("/programmers/calendar", "GET", "GET 요청 성공 !!")
  });
}

// calendar POST 요청
// 상세 일정 추가하기
module.exports.POST = function(dynamo, queryparam, postbody, callback) {
  callback(null, {
    'statusCode': 400,
    'body': errorMessage("/programmers/calendar", "POST", "POST 요청 성공 !!")
  });
}
