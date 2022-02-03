const url = require('url');

module.exports = {
    run: async (req, res) => {
        const urlObj = url.parse(req.url, true);
        const info = tokenExist(urlObj.query.token) 
        if(info && info.type == "ValideAccount"){
            deleteToken(urlObj.query.token)
            const ID = await writeDB(info.email, {"email": info.email, "pwd": info.pwd, "deviceId": [info["deviceId"]]})
            await setProfileDB(info.email, {"email": info.email, "id": ID, "list": [
                {"title":"Pseudo","text":"pseudo"},
                {"title":"Votre devise","text":""},
                {"title":"Sports","text":""},
                {"title":"Etude/Profession","text":""},
                {"title":"Jeux vidéos","text":""},
                {"title":"Autres activités","text":""},
                {"title":"Films appréciés","text":""},
                {"title":"Séries appréciées","text":""},
                {"title":"Meilleur voyage","text":""},
                {"title":"Endroit à découvrir","text":""},
                {"title":"Chose à faire avant de mourrir","text":""},
                {"title":"Anecdote rigolotte","text":""},
                {"title":"Blague préférée","text":""},
                {"title":"Mes activitées de hors la loi","text":""},
                {"title":"Réseau le plus utilisé","text":""},
                {"title":"Mouvements soutenus","text":""},
                {"title":"Avis politique","text":""},
                {"title":"Age","text":""},
                {"title":"Sexe","text":""},
                {"title":"Prénom","text":""},
                {"title":"Genre","text":""}
            ],
            "conv": [],
            "last": {}
            })
            res.render("confirm", {"title":"Validation", "subtitle":"Votre adresse email a été confirmée, votre compte est maintenant activé."})
            log("ValideAccount", "successful", `${info.email}`)
        }
    }
}