const url = require('url');

module.exports = {
    run: async (req, res) => {
        if(!req.body.action) return;
        switch (req.body.action) {
            case "forgetPassword":
                req.body.email = req.body.email.toLowerCase().replaceAll(" ", "")
                if(req.body.email && await existDB(req.body.email)){

                    if(filterToken("forgetPassword", "email", req.body.email)){
                        res.send({
                            "statut" : "error",
                            "info" : "Un mail de changement de mots de passe a déjà étais envoyé à cette adresse."
                        });
                        return
                    }

                    const token = newToken({
                        "type": "forgetPassword",
                        "email": req.body.email
                    }, 1800000)

                    listMail.push({
                        "email": req.body.email,
                        "subject": "Changement de mot de passe.",
                        "text": "https://2bee.gq/?get=forgetPassword&token=" + token
                    })

                    res.send({
                        "statut" : "successful",
                        "info" : "Un mail de confirmation a étais envoyé."
                    });
                    

                }
                else{
                    res.send({
                        "statut" : "error",
                        "info" : "Cette adresse email n'est pas inscrite."
                    });
                }
                break;

            case "changePassword":
                const info = tokenExist(req.body.token)
                if(info && info.type == "forgetPassword"){
                    deleteToken(req.body.token)
                    await custom("updateOne", "user", {"email": info.email}, { $set: {"pwd": req.body.pwd} });
                    log("changePassword", "successful", info.email)
                    res.send({
                        "statut" : "successful",
                        "info" : "Le mot de passe a bien été mis a jour."
                    });
                }
                else{
                    res.send({
                        "statut" : "error",
                        "info" : "Tokent invalide."
                    });
                }
                break;
        }
    }
}