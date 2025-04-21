rem npm run build

rem echo off
rem IF %SERV_USER%=="" SET /p "SERV_USER=Enter username: "

SET SERV_USER=alavr
SET SERVER=185.252.24.146
SET SRC=dist
rem SET DST=mui-uf-admin

SET DST=/opt/www

rem powershell -Command "(gc dist/index.html) -replace '/assets/', 'assets/' | Out-File -encoding ASCII dist/index.html"

rem ssh %SERV_USER%@%SERVER% "mkdir -p %DST% && rm -r %DST%/*"
scp -r %SRC%/* %SERV_USER%@%SERVER%:%DST%
