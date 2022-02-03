async function match(){
    if(waitQuestion[0] && waitRecherche[0]){
        if(waitList[waitQuestion[0]] && listSocket[waitQuestion[0]].connected){
            if(waitList[waitRecherche[0]] && listSocket[waitRecherche[0]].connected){
                if(!await custom("findOne", "conversation", {[waitQuestion[0]]: `${waitQuestion[0]} ${waitRecherche[0]}`}, {})){
                    let id1 = waitQuestion[0]
                    let q = questionList[id1]
                    let id2 = waitRecherche[0]

                    waitQuestion.splice(0, 1)
                    waitRecherche.splice(0, 1)
                    delete waitList[id1]
                    delete waitList[id2]
                    delete questionList[id1]

                    await createConv(id1, id2)

                    listSocket[id1].emit("findBody", q, id2);
                    listSocket[id2].emit("findBody", q, id1);
                }
                else{
                    
                    waitRecherche.splice(1, 0, waitRecherche[0])
                    waitRecherche.splice(0, 1)
                }

            }
            else{
                waitRecherche.splice(0, 1)
            }
        }
        else{
            waitQuestion.splice(0, 1)
        }
    }
    setTimeout(() => {
        match()
    }, 50);
}
match()