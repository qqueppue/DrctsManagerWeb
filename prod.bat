set NODE_ENV=production
set NODE_OPTIONS="--max-http-header-size=81920"
forever start --minUptime 5000 --spinSleepTime 2000 -l forever.log -o out.log -e err.log -a ./build/main.js
