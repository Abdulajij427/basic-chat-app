import {WebSocketServer , WebSocket} from  'ws';

const wss = new WebSocketServer({port:8080});


interface User {
    socket: WebSocket;
    room: string;
}


let userCount = 0;
let allSockets: User[] = [];

wss.on("connection", (socket)=>{

    
    socket.on("message", (message)=>{
        console.log("server is started");
        const parsedMessage = JSON.parse(message as unknown as string);
    
        if(parsedMessage.type == "join"){
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId
            })
        }

        if(parsedMessage.type == "chat"){
            let currentUserRoom = null;

            for(const user of allSockets){
                if(user.socket == socket){
                    currentUserRoom = user.room;
                }
            }

            for(const user of allSockets){
                if(user.room == currentUserRoom){
                    user.socket.send(parsedMessage.payload.message);
                }
            }
        } 
    })
 
})


