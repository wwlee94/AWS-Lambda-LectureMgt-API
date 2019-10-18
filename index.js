// const doc = require('dynamodb-doc');
// const dynamo = new doc.DynamoDB();
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
    const operation = event.httpMethod;
    const resource = event.resource;
    // queryparam
    const queryparam = event.queryStringParameters;
    // post body
    const body = JSON.parse(event.body);

    // 강좌 테이블
    if(resource == "/programmers/lecture"){
        if(operation == 'GET'){
            if(queryparam != null){
                // code 값이 있으면
                if("code" in queryparam){
                    if(queryparam["code"] != ""){   // 빈값이 아닐때
                        console.log("search code by "+queryparam["code"]);
                        var params = {
                            TableName: 'programmers_lecture',
                            KeyConditionExpression : "code = :code",
                            ExpressionAttributeValues: {
                                ":code" : queryparam["code"]
                            }
                        }
                        dynamo.query(params, (err, data) => {
                            callback(null, {
                                'statusCode': 200,
                                'headers': {},
                                'body': JSON.stringify(data)
                            });
                        });
                    }
                }
                // lecture 값이 있으면
                else if("lecture" in queryparam){
                    if(queryparam["lecture"] != ""){ // 빈값이 아닐때
                        console.log("search lecture")
                        var params = {
                            TableName: 'programmers_lecture',
                            FilterExpression : "(begins_with(lecture, :lec))",
                            ExpressionAttributeValues: {
                                ":lec" : queryparam["lecture"]
                            }
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
            else{
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
    //시간표 테이블
    else if(resource == "/programmers/timetable"){
        switch (operation) {
            case 'POST':
                //validation
                if(body != null){
                    if("user_key" in body && "code" in body){
                        //데이터 추가 작업
                        console.log("insert timetable data");
                        var params = {
                            TableName: 'programmers_timetable',
                            Item: {
                                "user_key" : body["user_key"],
                                "lecture_code" : body["code"]
                            }
                        }
                        var text = "";
                        dynamo.put(params, (err,data) => {
                            if(err)  text = JSON.stringify("데이터 삽입 에러 : "+err);
                            else text = JSON.stringify("데이터 삽입 성공 !");
                            callback(null, {
                                'statusCode': 200,
                                'headers': {},
                                'body': text
                            });
                        });
                    }
                }
                break;
            case 'DELETE':
                //validation
                if(body != null){
                    if("user_key" in body && "code" in body){
                        //데이터 추가 작업
                        console.log("delete timetable data");
                        var params = {
                            TableName: 'programmers_timetable',
                            Key: {
                                "user_key" : body["user_key"],
                                "lecture_code" : body["code"]
                            },
                            ConditionExpression:"user_key = :key and lecture_code = :code",
                            ExpressionAttributeValues: {
                                ":key": body["user_key"],
                                ":code" : body["code"]
                            }
                        }
                        var text = "";
                        dynamo.delete(params, (err,data) => {
                            if(err)  text = JSON.stringify("데이터 삭제 에러 : "+err);
                            else text = JSON.stringify("데이터 삭제 성공 !");
                            callback(null, {
                                'statusCode': 200,
                                'headers': {},
                                'body': text
                            });
                        });
                    }
                }
                break;
            case 'GET':
                if(queryparam != null){
                    if("user_key" in queryparam){
                        var params = {
                            TableName: 'programmers_timetable',
                            ProjectionExpression : "lecture_code",  //보여줄 column
                            KeyConditionExpression : "user_key = :key",
                            ExpressionAttributeValues: {
                                ":key" : queryparam["user_key"]
                            }
                        }
                        dynamo.query(params, (err, data) => {
                            callback(null, {
                                'statusCode': 200,
                                'headers': {},
                                'body': JSON.stringify(data)
                            });
                        });
                    }
                }
                break;
            default:
                callback(new Error('Unrecognized operation'));
                break;
        }
    }
};
