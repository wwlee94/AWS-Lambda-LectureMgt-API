const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

//에러 메시지
const errorMessage = require("./errorMessage");
//강좌 controller
const lecture = require("./lecturesController");
//시간표 controller
const timetable = require("./timetableController");

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
  if (resource === "/programmers/lectures") {
    if(operation === "GET"){
      lecture.GET(dynamo, queryparam, callback);
    }
    else{
      callback(null, {
        'statusCode': 405,
        'body': errorMessage(resource, operation, "Method Not Allowed - 지정된 Method는 사용할 수 없습니다.")
      });
    }
  }
  //시간표 테이블
  else if (resource === "/programmers/timetable") {
    if(operation === "GET"){
      timetable.GET(dynamo, queryparam, body, callback);
    }
    else if(operation === "POST"){
      timetable.POST(dynamo, queryparam, body, callback);
    }
    else if(operation === "DELETE"){
      timetable.DELETE(dynamo, queryparam, body, callback);
    }
    else{
      callback(null, {
        'statusCode': 405,
        'body': errorMessage(resource, operation, "Method Not Allowed - 지정된 Method는 사용할 수 없습니다.")
      });
    }
  }
  // resource error
  else{
    callback(null, {
      'statusCode': 404,
      'body': errorMessage(resource, operation, "Not Found - 요청한 페이지(Resource)를 찾을 수 없습니다.")
    });
  }
};
