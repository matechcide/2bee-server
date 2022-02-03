const ObjectId = require('mongodb').ObjectId;

module.exports = {
    run: async (req, res) => {
        if(req.headers.action == "login"){
            if(req.body.id){
                const info = await custom("findOne", "admin",  {_id: new ObjectId(req.body.id)}, {projection:{ _id: 0, "email": 1 }})
                if(info){
                    const token = newToken({
                        "type": "admin",
                        "ip": req.headers["x-forwarded-for"]
                    })
                    
                    listMail.push({
                        "email": info.email,
                        "subject": 'Connexion panel administratif.',
                        "text": "https://2bee.gq/AdminPanel?token=" + token
                    })
    
                    res.send({
                        "statut": "successful",
                        "info": "Un email vous a étais envoyez pour vous connecter."
                    })
                }
                else{
                    res.send({
                        "statut": "error",
                        "info": "Saisissez un ID valide."
                    })
                }
            }
            else{
                res.send({
                    "statut": "error",
                    "info": "Saisissez un ID valide."
                })
            }
            return
        }
        const info = tokenExist(req.headers.token)
        if(!info || !info.type == "admin" || info.ip != req.headers["x-forwarded-for"]){
            res.send({
                "statut": "error",
                "info": "Session invalide."
            })
            return
        }
        switch (req.headers.action) {
            case "sendMail":
                for await(const item of await returnMail()){
                    listMail.push({
                        "email": item.email,
                        "subject": req.body.subject,
                        "text": req.body.text
                    })
                }
                res.send({
                    "statut": "successful",
                    "info": "Les emails ont été envoyer."
                })
                log("SendMail", "successful", `${req.body.subject} \n ${req.body.text}`)
                break;
    
            case "getStat":
                res.send({
                    "statut": "successful",
                    "info": {
                        "c": io.sockets.server.engine.clientsCount,
                        "sq": waitRecherche.length,
                        "sr": waitQuestion.length,
                        "m": await custom("count", "user", {}, {}),
                        "me": listMail.length,
                    }
                })
                break;
    
            case "getBeta":
                res.send({
                    "statut": "successful",
                    "info": await custom("find", "waitlist", {"email": { "$exists": true } }, {}, 100)
                })
                break;
    
            case "addBeta":
                await betaAccept(req.body)   
                listMail.push({
                    "email": req.body.email,
                    "subject": "Bienvenue dans l'équipe.",
                    "text": "Nous vous informons que vous avez rejoint l'équipe de bêta-testeur."
                })
    
                res.send({
                    "statut": "successful",
                    "info": ""
                })
                break;
            
            case "getLog":
                let filtre = {"action":{ "$exists": true }}
                if(req.body.index != "" && req.body.value != ""){
                    filtre = {
                        [req.body.index]: req.body.value
                    }
                }
                res.send({
                    "statut": "successful",
                    "info": await custom("find", "log", filtre, {}, 100)
                })
                break;
    
            case "deleteLog":
                if(req.body.index != "" && req.body.value != ""){
                    let filtre = {
                        [req.body.index]: req.body.value
                    }
                    res.send({
                        "statut": "successful",
                        "info": await custom("delete", "log", filtre, {})
                    })
                }
                break;

            case "sendUpDate":
                await custom("insertOne", "update", req.body)
                res.send({
                    "statut": "successful",
                    "info": "Mise à jour envoyer."
                })
                log("sendUpDate", "successful", `${req.body.version}`)
                break;
        }
    }
}