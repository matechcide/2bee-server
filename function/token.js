const rand=()=>Math.random(0).toString(36).substr(2);
const generateToken=(length)=>(rand()+rand()+rand()+rand()).substr(0,length);
const listToken = {}

global.newToken = function newToken(info, time=86400000){
    let newToken = generateToken(36)
    while(listToken[newToken]){
        newToken = generateToken(36)
    }
    listToken[newToken] = {
        "info": info,
        timeout : setTimeout(() => {
            delete listToken[newToken]
        }, time)
    }
    return newToken
}

global.tokenExist = function tokenExist(token){
    if(listToken[token]){
        return listToken[token]["info"]
    }
    else{
        return false
    }
}

global.deleteToken = function deleteToken(token){
    if(listToken[token]){
        clearTimeout(listToken[token].timeout)
        delete listToken[token]
        return true
    }
    else{
        return false
    }
}

global.filterToken = function filterToken(type, name, value){
    for(const token in listToken){
        if(listToken[token] && listToken[token].info.type == type && listToken[token].info[name] == value){
            return listToken[token].info
        }
    }
    return false
}
