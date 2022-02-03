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
        const messages = await getMessage(req.body.user1, req.body.user2)
        if(!messages){
            res.send({
                "statut" : "successful",
                "info" : "empty",
                "user": req.body.user1
            });
        }
        else{
            res.send({
                "statut" : "successful",
                "info" : messages
            });
        }  
    }
}