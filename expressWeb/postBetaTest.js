const url = require('url');

module.exports = {
    run: async (req, res) => {
        if(req.body && req.body.email && req.body.mdp && req.body.mdp.length > 7 && req.body.name && req.body.age){
            req.body.email = req.body.email.toLowerCase().replaceAll(" ", "")
            if(!await existBetaTest(req.body.email) && !filterToken("ValideBeta", "email", req.body.email) && !await existDB(req.body.email)){
                req.body.type = "ValideBeta"
                const token = newToken(req.body)
    
                listMail.push({
                    "email": req.body.email,
                    "subject": "Validation de l'email.",
                    "text": "https://2bee.gq/ValideBeta?token=" + token
                })
    
                res.send({
                    "statut" : "successful",
                    "info" : "Le mail de confirmation a été envoyé."
                });
    
            }
            else{
                res.send({
                    "statut" : "error",
                    "info" : "Cette adresse email est déjà utilisée."
                })
            }
        }
        else{
            res.send({
                "statut" : "error",
                "info" : "Entré invalide."
            })
        }
    }
}