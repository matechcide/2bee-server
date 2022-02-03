const url = require('url');

module.exports = {
    run: async (req, res) => {
        const urlObj = url.parse(req.url, true);
        const info = tokenExist(urlObj.query.token) 
        if(info && info.type == "ValideBeta"){
            deleteToken(urlObj.query.token)
            await createBetaTest(info)
            res.render("confirm", {"title":"Validation", "subtitle":"Votre adresse mail a été confirmée, nous vous recontacterons pour la validation de votre compte."})
            log("ValideBeta", "successful", `${info.email}`)
        }
    }
}