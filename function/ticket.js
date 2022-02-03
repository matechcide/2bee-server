function controleur(socket, idListSocket, ticket, info){
    if(!info){
        socket.disconnect(true)
    }
    else if(info.deviceId.indexOf(ticket[1]) == -1){
        socket.disconnect(true)
    }
    else if(idListSocket != ticket[2] || idListSocket != socket.id){
        socket.disconnect(true)
    }
    else if(info.id != ticket[3]){
        socket.disconnect(true)
    }
    else{
        return true
    }
    return false
}

module.exports = {
    controleur
}