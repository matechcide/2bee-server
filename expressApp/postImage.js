const sharp = require("sharp");
const fs = require('fs');

module.exports = {
    run: async (req, res) => {
        if(req.headers["user-agent"] != "Contact" || req.headers["host"] != "2bee.gq" || !req.headers["token"]) return;
        const info = tokenExist(req.headers.token)
        if(!info || (info && info.type != "log")){
            res.send({
                "statut" : "error",
                "info" : "Token invalide, redémarrer l'application."
            });
            return;
        }
        if(info.deviceId.indexOf(req.headers["deviceid"]) == -1){
            res.send({
                "statut" : "error",
                "info" : "Ce n'est pas le méme appareil."
            });
            return;
        }
        if(fs.existsSync(__dirname + "/../pdp/" + info.email + ".png")){
            delete require.cache[require.resolve(__dirname + "/../pdp/" + info.email + ".png")];
            fs.rmSync(__dirname + "/../pdp/" + info.email + ".png")
        }
        let name = Date.now();
        fs.writeFileSync(__dirname + "/../pdp/" + "temp" + name + info.email + ".png", req.body.base64, 'base64');
        sharp(__dirname + "/../pdp/" + "temp" + name + info.email + ".png").resize({ height:400, width:400}).toFile(__dirname + "/../pdp/" + name + info.email + ".png").then( () => {
            fs.renameSync(__dirname + "/../pdp/" + name + info.email + ".png", __dirname + "/../pdp/" + info.email + ".png")
            fs.rmSync(__dirname + "/../pdp/" + "temp" + name + info.email + ".png")
            res.send({
                "statut" : "successful"
            });
        })
    }
}