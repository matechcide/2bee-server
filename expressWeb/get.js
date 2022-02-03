const url = require('url');

module.exports = {
    run: (req, res) => {
        const urlObj = url.parse(req.url, true);
        if(urlObj.query.token){
            const info = tokenExist(urlObj.query.token)
            if(info && info.type == "web"){
                res.render("indexON");
                return
            }

        }
        res.render("indexOFF");
    }
}