@echo off
echo started
rem npm run build

SET SERV_USER=alavr
SET SERVER=vca.theweb.place
SET SRC=dist

SET DST=/opt/vca

rem todo
rem ssh %SERV_USER%@%SERVER% "cd %DST% && rm -r $(ls -A %DST% | grep -v back)"

ssh %SERV_USER%@%SERVER% "cd %DST%"
scp -r %SRC%/* %SERV_USER%@%SERVER%:%DST%