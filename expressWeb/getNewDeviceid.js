const url = require('url');

module.exports = {
    run: async (req, res) => {
        const urlObj = url.parse(req.url, true);
        const info = tokenExist(urlObj.query.token) 
        if(info && info.type == "newDeviceId"){
            deleteToken(urlObj.query.token)
            await newDeviceId(info.email, info.newDeviceId)
            res.render("confirm", {"title":"Autorisation", "subtitle":"Vous avez autorisé un nouvel appareil allez sur votre compte."})
            log("NewDeviceid", "successful", `${info.email} ${info.newDeviceId}`)
        }
    }
}