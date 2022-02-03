const url = require('url');

module.exports = {
    run: async (req, res) => {
        const urlObj = url.parse(req.url, true);
        if(urlObj.query && urlObj.query.token) {
            const info = tokenExist(urlObj.query.token)
            if(info && info.type == "admin" && info.ip == req.headers["x-forwarded-for"]){
                res.render("adminPanel")
                return;
            }
        }
        res.render("loginAdmin")
    }
}