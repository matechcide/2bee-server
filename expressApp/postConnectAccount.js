module.exports = {
    run: async (req, res) => {
        if(req.headers["user-agent"] != "Contact" || req.headers["host"] != "2bee.gq" || req.headers["token"] != "") return;
        req.body.email = req.body.email.toLowerCase().replaceAll(" ", "")
        const info = await readDB(`${req.body.email}`)
        if(!info || req.body.pwd != info.pwd){
            res.send({
                "statut" : "error",
                "info" : "Problème avec les identifiant."
            });
            return;
        }
        if(info.deviceId.indexOf(req.headers["deviceid"]) == -1){
            
            if(filterToken("newDeviceId", "email", req.body.email)){
                res.send({
                    "statut" : "error",
                    "info" : "Un mail d'authentification de téléphone a déjà étais envoyé à cette adresse."
                });
                return
            }

            const token = newToken({
                "type": "newDeviceId",
                "email": req.body.email,
                "newDeviceId" : req.headers["deviceid"]
            })

            listMail.push({
                "email": req.body.email,
                "subject": 'Tentative de connexion à votre compte.',
                "text": "Quelqu'un tente de se connecter à votre compte. Si c'est vous, cliquez sur le lien suivant :\n\nhttps://2bee.gq/NewDeviceid?token=" + token
            })
            res.send({
                "statut" : "error",
                "info" : "Ce n'est pas le méme appareil, un mail de confirmation a été envoyé à votre adresse."
            });
            
            return;
        }

        info.id = `${info._id}`
        if(req.headers["v"] != V){
            res.send({
                "statut" : "error",
                "info" : "L'application n'est pas à jour."
            });
            return;
        }

        delete info._id
        info.type = "log"
        res.send({
            "statut" : "successful",
            "token": newToken(info),
            "id": info.id,
            "conv": await returnConv(info.id)
        });
    }
}