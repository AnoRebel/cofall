# CoFall(Code For All)

**Code Collaboration in real-time with a chat feature**

### [Demo](https://cofall.now.sh): https://cofall.now.sh

Made with:

 - ReactJS
 - NodeJS
 - Express
 - Socket.io

To run this;
 
  - Clone the repo
  
	`git clone https://github.com/anorebel/cofall.git`
 
  - Enter the directory
  
	  `cd cofall`
 
  - Install dependencies
  
	  `npm install`
or
	  `yarn`
	  
  - Create a socket.io server with all the events needed and more or use my custom server [https://cofall-signaling-server.herokuapp.com](https://cofall-signaling-server.herokuapp.com) with limited features

  - Edit `src/components/room.js` and add the ENDPOINT to the server URL you created

 - Run:
 	- In development:
	 	`npm dev`
	 		or
	 	`yarn dev`
	 	
	 - In production:
	 	`npm start`
	 		or
	 	`yarn start`

 - Build (and minify):
    `npm run build`
          or
    `yarn build`
