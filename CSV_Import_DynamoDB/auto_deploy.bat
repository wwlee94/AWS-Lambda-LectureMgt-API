del csv_import.zip
7z a -r ./csv_import.zip ./lambda_function.py
aws lambda update-function-code --function-name import_programmers_lecture --zip-file fileb://csv_import.zip
