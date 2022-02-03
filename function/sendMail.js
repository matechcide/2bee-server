const nodemailer = require('nodemailer');
const listTransporter = ["2bee.real1@gmail.com"]

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: listTransporter[0],
        pass: '/contact1409'
    }
});

async function sendMail(){
    if(listMail[0]){
        await new Promise((resolve)=>{
            let mailOptions = {
                from: transporter.transporter.auth.user,
                to: listMail[0].email,
                subject: listMail[0].subject,
                text: listMail[0].text
            };

            transporter.sendMail(mailOptions, function(error, info){
                if(error && `${error}`.includes("Temporary System Problem. Try again later") < 1){
                    log("sendMail", "error", `${listMail[0].email} : ${error}`)
                    socketBot.emit("APIerror", `${listMail[0].email} : ${error}`)
                    listMail.splice(0, 1)
                    resolve()
                }
                else if(error && `${error}`.includes("Temporary System Problem. Try again later") > 0){
                    let index = listTransporter.indexOf(transporter.transporter.auth.user)
                    if(!listTransporter[index+1]){
                        index = -1
                    }
                    transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: listTransporter[index+1],
                            pass: '/contact1409'
                        }
                    });

                    setTimeout(() => {
                        resolve()
                    }, 500);
                }
                else{
                    listMail.splice(0, 1)
                    resolve()
                }
            });
        })
    }
    setTimeout(() => {
        sendMail()
    }, 50);
}
sendMail()