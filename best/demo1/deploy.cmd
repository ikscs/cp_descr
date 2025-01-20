
rem npm run build

ssh alavr@188.93.118.18 rm -r /opt/ikscs/best/demo1/*
scp -r build/* alavr@188.93.118.18:/opt/ikscs/best/demo1
