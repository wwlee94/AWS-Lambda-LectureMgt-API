del index.zip
7z a -r ./index.zip ./src/*
aws lambda update-function-code --function-name API_Example --zip-file fileb://index.zip
