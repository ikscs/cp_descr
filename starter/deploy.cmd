
rem npm run build

ssh alavr@188.93.118.18 rm -r /opt/ikscs/react1/dist/assets/*
scp -r dist alavr@188.93.118.18:/opt/ikscs/react1
