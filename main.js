const cors = require('cors');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const expressip = require('express-ip');
const { controleur } = require(__dirname + "/function/ticket");
const fs = require("fs");
global.io = require("socket.io")(server);

app.set('view engine', 'ejs');
app.use(expressip().getIpInfoMiddleware);
app.use('/public', express.static('public'));
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.set('trust proxy', true);
app.set('port', 1080);
app.use(express.json());

global.expressApp = new Object()
global.expressWeb = new Object()

fs.readdir(__dirname + '/expressApp', (err, files) => {
	files.forEach(file => {
		if (!file.endsWith('.js')) return;
        expressApp[file.replace(".js", "")] = require(__dirname + `/expressApp/${file}`);
	})
})

fs.readdir(__dirname + '/expressWeb', (err, files) => {
	files.forEach(file => {
		if (!file.endsWith('.js')) return;
        expressWeb[file.replace(".js", "")] = require(__dirname + `/expressWeb/${file}`);
	})
})

global.listMail = []
global.waitQuestion = []
global.questionList = {}
global.waitRecherche = []
global.waitList = {}
global.listSocket = {}
global.savConvList = {}
global.V = "0.1.2"

require(__dirname + "/function/token");
require(__dirname + '/function/mongoDB');
require(__dirname + "/function/match");
require(__dirname + "/function/sendMail");

let socketBot

app.use("*", async (req, res) =>{
    if(expressApp[req.method.toLocaleLowerCase() + req.params["0"].replaceAll("/", "")]){
        await expressApp[req.method.toLocaleLowerCase() + req.params["0"].replaceAll("/", "")].run(req, res)
    }
    else if(expressWeb[req.method.toLocaleLowerCase() + req.params["0"].replaceAll("/", "")]){
        await expressWeb[req.method.toLocaleLowerCase() + req.params["0"].replaceAll("/", "")].run(req, res)
    }
    else{
        res.status(404).json({
            "statut" : "error",
            "info": "URL not found."
        })
    }
})

io.on('connection', socket => {

    socket.on('discordBot', (code) => {
        if(code != "monsupercode") return
        socketBot = socket
        
    });

    socket.on('login', (token) =>{
        const info = tokenExist(token)
        if(info){
            listSocket[info.id] = socket
        }
    });

    socket.on('searchQuestions', (ticket) =>{
        const info = tokenExist(ticket[0])
        if(controleur(socket, listSocket[info.id].id, ticket, info) && !waitList[ticket[3]]){
            waitRecherche.push(ticket[3])
            waitList[ticket[3]] = [ticket[3], false]
        }
    });

    socket.on('putQuestion', (ticket, question) =>{
        const info = tokenExist(ticket[0])
        if(controleur(socket, listSocket[info.id].id, ticket, info) && !waitList[ticket[3]]){
            waitQuestion.push(ticket[3])
            questionList[ticket[3]] = question
            waitList[ticket[3]] = [ticket[3], true]
        }
    });

    socket.on('quitWaiting', (ticket) =>{
        const info = tokenExist(ticket[0])
        if(controleur(socket, listSocket[info.id].id, ticket, info) && waitList[ticket[3]]){
            if(waitList[ticket[3]][1]){
                let place = waitQuestion.indexOf(waitList[ticket[3]][0])
                waitQuestion.splice(place, 1)
                delete questionList[ticket[3]]
            }
            else{
                let place = waitRecherche.indexOf(waitList[ticket[3]][0])
                waitRecherche.splice(place, 1)
            }
            delete waitList[ticket[3]]
        }
    });
    
    socket.on('sendMessage', async ( ticket, user1, message, user2 ) =>{
        const info = tokenExist(ticket[0])
        if(controleur(socket, listSocket[info.id].id, ticket, info)){
            let date = Date.now()
            const info = await updateConv([message, user1, date, ""], user1, user2)
            if(info){
                if(listSocket[user1] && listSocket[user1].connected){
                    listSocket[user1].emit("message", [message, user1, date, ""], info, ticket[3]);
                }
                socket.emit("message", [message, user1, date, ""], info, ticket[3]);
            }
        }
    });

    socket.on('reactMessage', async ( ticket, user1, react, user2 ) =>{
        const info = tokenExist(ticket[0])
        if(controleur(socket, listSocket[info.id].id, ticket, info)){
            const info = await updateReact(react, user1, user2)
            if(info){
                if(listSocket[user1] && listSocket[user1].connected){
                    listSocket[user1].emit("message", [react, user1, "react"], info, ticket[3]);
                }
                socket.emit("message", [react, user1, "react"], info, ticket[3]);
            }
        }
    });

    socket.on('kick', async ( ticket, user1, user2 ) => {
        const info = tokenExist(ticket[0])
        if(controleur(socket, listSocket[info.id].id, ticket, info)){
            await supConv(user1, user2)
            await supPConv(user1, user2)
            await supPConv(user2, user1)
            if(listSocket[user1] && listSocket[user1].connected){
                listSocket[user1].emit("message", "", false, user2);
            }
        }
    });

    socket.on('addConv', async ( ticket, user1, user2 ) =>{
        const info = tokenExist(ticket[0])
        if(controleur(socket, listSocket[info.id].id, ticket, info)){
            if(savConvList[user2] == user1){
                delete savConvList[user2]
                await addPConv(user1, user2)
                await addPConv(user2, user1)
                listSocket[user1].emit("addToConv", user2);
                listSocket[user2].emit("addToConv", user1);
            }
            else{
                savConvList[user1] = user2
            }
            setTimeout(() => {
                if(savConvList[user1] == user2){
                    delete savConvList[user1]
                }
            }, 600000);
        }
    });

});

server.listen(3080, ()=>{
    console.log('Serving on port 3080');
})

for (const type of ['uncaughtException', 'SIGINT']){
	process.on(type, async (error) => {
        if(`${error}` == "SIGINT"){
            //await log("Arrét manuel", "successful", "")
            process.exit(1);
        }
        console.log(`${error}`);
        try {
            await log("uncaughtException", "error", `${error.message}`)
		    socketBot.emit("APIerror", `${error.message}`)
        } catch (error) {
        }
        setTimeout(() => {
            process.exit(1);
        }, 1000);
	});
}