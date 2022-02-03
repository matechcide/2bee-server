const url = require('url');
const fs = require("fs");
const path = require('path');

module.exports = {
    run: async (req, res) => {
        const urlObj = url.parse(req.url, true);
        const info = tokenExist(urlObj.query.token)
        if(!info || (info && info.type != "log")){
            res.send({
                "statut" : "error",
                "info" : "Token invalide, redémarrer l'application."
            });
            return;
        }
        if(!urlObj.query.user1 && !urlObj.query.user2){
            if(fs.existsSync(path.resolve(__dirname + "/../pdp/" + info.email + ".png"))){
                res.sendFile(path.resolve(__dirname + "/../pdp/" + info.email + ".png"))
            }
            else{
                res.sendFile(path.resolve(__dirname + "/../public/images/waiting.gif"))
            }
        }
        else if(urlObj.query.user1 && urlObj.query.user2 && urlObj.query.user2 == info.id){
            let infoConv = await custom("findOne", "conversation", {[urlObj.query.user1]: `${urlObj.query.user1} ${urlObj.query.user2}`}, {projection:{ _id: 0, "lvl": 1 }})
            if(infoConv && infoConv.lvl > 20){
                let profile = await custom("findOne", "profile", {"id": urlObj.query.user1}, { projection:{ _id: 0, "email": 1 } })
                res.sendFile(path.resolve(__dirname + "/../pdp/" + profile.email + ".png"))
            }
            else{
                res.sendFile(path.resolve(__dirname + "/../public/images/unknown.jpg"))
            }
        }
    }
}