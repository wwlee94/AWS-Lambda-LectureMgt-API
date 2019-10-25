const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

//에러 메시지
const errorMessage = require("./errorMessage");
//강좌 controller
const lecture = require("./lecturesController");
//시간표 controller
const timetable = require("./timetableController");
//상세 일정 controller
const calendar = require("./memoController");

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
    if (operation === "GET") {
      lecture.GET(dynamo, queryparam, callback);
    }
  }
  //시간표 테이블
  else if (resource === "/programmers/timetable") {
    if (operation === "GET") {
      timetable.GET(dynamo, queryparam, callback);
    } else if (operation === "POST") {
      timetable.POST(dynamo, body, callback);
    } else if (operation === "DELETE") {
      timetable.DELETE(dynamo, body, callback);
    }
  } else if (resource === "/programmers/memo") {
    if (operation === "GET") {
      calendar.GET(dynamo, queryparam, callback);
    } else if (operation === "POST") {
      calendar.POST(dynamo, body, callback);
    } else if (operation === "DELETE") {
      calendar.DELETE(dynamo, body, callback);
    }
  }
};
