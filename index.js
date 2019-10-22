const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

//강좌 controller
const lecture = require("./lectureController");
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
  if (resource == "/programmers/lecture") {
    if(operation == "GET"){
      lecture.GET(dynamo, queryparam, callback);
    }
  }
  //시간표 테이블
  else if (resource == "/programmers/timetable") {
    if(operation == "GET"){
      timetable.GET(dynamo, queryparam, body, callback);
    }
    else if(operation == "POST"){
      timetable.POST(dynamo, queryparam, body, callback);
    }
    else if(operation == "DELETE"){
      timetable.DELETE(dynamo, queryparam, body, callback);
    }
  }
};
