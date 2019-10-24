import json
import csv
import boto3

def lambda_handler(event, context):
    region= 'ap-northeast-2'
    recList = []

    s3 = boto3.client('s3')
    dyndb = boto3.client('dynamodb', region_name= region)
    confile = s3.get_object(Bucket='aws-lecture-bucket', Key='programmers_lecture.csv')
    recList = confile['Body'].read().decode("utf-8-sig").split('\n')
    firstrecord = True
    csv_reader = csv.reader(recList, delimiter=',', quotechar='"')
    for row in csv_reader:
        if firstrecord:
            firstrecord = False
            continue
        if len(row) >= 1:
            code = row[0]
            lecture = row[1]
            professor = row[2]
            location = row[3]
            start_time = row[4]
            end_time = row[5]
            dayofweek = row[6]
            day_list = list(dayofweek) # str -> list 씌우면 하나하나 나뉘어짐
            response = dyndb.put_item(
                TableName='programmers_lecture',
                Item={
                    'code' : {'S':code},
                    'lecture':{'S':lecture},
                    'professor':{'S':professor},
                    'location' : {'S':location},
                    'start_time':{'S':start_time},
                    'end_time':{'S':end_time},
                    'dayofweek':{
                        'SS': day_list
                    }
                }
            )
            print("put success")
