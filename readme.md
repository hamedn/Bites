Server Information

SSH onto server: "ssh root@192.34.58.204"

user: root
passwd: WallachH8

Node.js Deployment Info:

Logs: "pm2 logs server"
Restart: "pm2 restart server"


How to update server from github:
ssh root@192.34.58.204
cd /home/Bites
git pull origin master 							(password: nthoth)
cd BitesAPI
npm install
pm2 restart server
cd /home
chmod -R 777 Bites
