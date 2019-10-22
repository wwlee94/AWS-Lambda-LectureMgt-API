del index.zip
7z a -r ./index.zip *
aws lambda update-function-code --function-name import_programmers_lecture --zip-file fileb://index.zip
