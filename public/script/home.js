let anime1 = false
let up1 = false

function overimg1() {
    up1 = true
    if(anime1) return
    anime1 = true
    let img = document.getElementById("img1")
    let round = 0
    const interval = setInterval(
        () => {
            round-=3
            img.style.transform = `translateX(${round}px)`
            if(round == -36){
                clearInterval(interval)
                anime1 = false
                if(!up1){
                    outimg1()
                }

            }
        }, 20);
    
}

function outimg1() {
    up1 = false
    if(anime1) return
    anime1 = true
    let img = document.getElementById("img1")
    let round = -39
    const interval = setInterval(
        () => {
            round+=3
            img.style.transform = `translateX(${round}px)`
            if(round == 0){
                clearInterval(interval)
                anime1 = false
                if(up1){
                    overimg1()
                }
            }
        }, 20);
}

let anime2 = false
let up2 = false

function overimg2() {
    up2 = true
    if(anime2) return
    anime2 = true
    let img = document.getElementById("img2")
    let round = 0
    const interval = setInterval(
        () => {
            round+=1
            img.style.transform = `scale(${1+round/100})`
            if(round == 11){
                clearInterval(interval)
                anime2 = false
                if(!up2){
                    outimg2()
                }

            }
        }, 20);
    
}

function outimg2() {
    up2 = false
    if(anime2) return
    anime2 = true
    let img = document.getElementById("img2")
    let round = 11
    const interval = setInterval(
        () => {
            round-=1
            img.style.transform = `scale(${1+round/100})`
            if(round == 0){
                clearInterval(interval)
                anime2 = false
                if(up2){
                    overimg2()
                }
            }
        }, 20);
}

let anime3 = false
let up3 = false

function overimg3() {
    up3 = true
    if(anime3) return
    anime3 = true
    let img = document.getElementById("img3")
    let round = 0
    const interval = setInterval(
        () => {
            round+=3
            img.style.transform = `translateX(${round}px)`
            if(round == 36){
                clearInterval(interval)
                anime3 = false
                if(!up3){
                    outimg3()
                }

            }
        }, 20);
    
}

function outimg3() {
    up3 = false
    if(anime3) return
    anime3 = true
    let img = document.getElementById("img3")
    let round = 39
    const interval = setInterval(
        () => {
            round-=3
            img.style.transform = `translateX(${round}px)`
            if(round == 0){
                clearInterval(interval)
                anime3 = false
                if(up3){
                    overimg3()
                }
            }
        }, 20);
}