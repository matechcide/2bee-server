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
        let infoConv = await returnConv(info.id)
        res.send({
            "statut" : "successful",
            "info" : infoConv[0],
            "last" : infoConv[1]
        });
    }
}