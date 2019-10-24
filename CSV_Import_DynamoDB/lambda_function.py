import json
import csv
import boto3

def lambda_handler(event, context):
    region= 'ap-northeast-2'
    recList = []

    s3 = boto3.client('s3')
    dyndb = boto3.client('dynamodb', region_name= region)
    confile = s3.get_object(Bucket='aws-lecture-bucket', Key='programmers_lecture_v2.csv')
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
            starttime = row[3]
            endtime = row[4]
            dayofweek = row[5]
            day_list = list(dayofweek) # str -> list 씌우면 하나하나 나뉘어짐
            response = dyndb.put_item(
                TableName='programmers_lecture',
                Item={
                    'code' : {'S':code},
                    'lecture':{'S':lecture},
                    'professor':{'S':professor},
                    'starttime':{'S':starttime},
                    'endtime':{'S':endtime},
                    'dayofweek':{
                        'SS': day_list
                    }
                }
            )
            print("put success")
