module.exports = {
    run: async (req, res) => {
        if(req.headers["user-agent"] != "Contact" || req.headers["host"] != "2bee.gq" || req.headers["token"] != "") return;
        res.send({
            "statut" : "error",
            "info" : "La création de compte n'est pas encore autorisée."
        });
        return
        req.body.email = req.body.email.toLowerCase().replaceAll(" ", "")
        if(await existDB(req.body.email)){
            res.send({
                "statut" : "error",
                "info" : "Cette adresse Email est déjà utilisé."
            });
            return;
        }
        if(filterToken("ValideAccount", "email", req.body.email)){
            res.send({
                "statut" : "error",
                "info" : "Cette adresse Email est en cours de validation."
            });
            return;
        }
        const token = newToken({
            "type": "ValideAccount",
            "email": req.body.email,
            "pwd": req.body.pwd,
            "deviceId": req.headers["deviceid"]
        })

        listMail.push({
            "email": req.body.email,
            "subject": "Validation de l'email.",
            "text": "https://2bee.gq/ValideAccount?token=" + token
        })

        res.send({
            "statut" : "successful",
            "info" : "Le mail de confirmation a étais envoyé."
        });
    }
}