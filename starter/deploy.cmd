rem npm run build

@echo off
rem IF %SERV_USER%=="" SET /p "SERV_USER=Enter username: "

SET SERV_USER=alavr
SET SERVER=188.93.118.18
SET SRC=dist
SET DST=demo2

rem copy copy\index.html dist\index.html

powershell -Command "(gc dist/index.html) -replace '/assets/', 'assets/' | Out-File -encoding ASCII dist/index.html"

SET DST=/opt/ikscs/react1/dist/%DST%

ssh %SERV_USER%@%SERVER% "mkdir -p %DST% && rm -r %DST%/*"
scp -r %SRC%/* %SERV_USER%@%SERVER%:%DST%