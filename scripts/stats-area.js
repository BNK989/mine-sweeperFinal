'use strict'

function setLevelName(){
    const level = gGame.levels.find((level)=> level.isCurrent)
    const nameArea = document.querySelector('.level-name')

    nameArea.innerText = level.name
}

function emoji(mode){
    const elEmoji = document.querySelector('div.smile')
    const currentFace = elEmoji.innerText
    elEmoji.innerText = mode

    setTimeout(()=>{
        elEmoji.innerText = currentFace
    },1500)

}

function freshStart(){
    const button = `<button class="level-picker" title="easy" onclick="init(16,2,true)">Restart</button>`
    modalSetUp('Are you sure', 'This will completely restart the game all progress will be lost.',button)
    gModal.showModal()
}

function levelSelector(){
    let buttons = ''
    for(let level of gGame.levels){
       buttons += `<button class="level-picker" title="${level.difficulty}" onclick="init(${level.field},${level.mines},true)">${level.name}</button>`
    }
    modalSetUp('Select level', 'Choose the rank you want to play', buttons)
    gModal.showModal()
}

function showRules(){
    document.querySelector('.instruction-modal').classList.toggle('show')
}

function modalSetUp(header, text, buttons){
    const modalTitle = document.querySelector(".dialog-container h3")
    const modalTalk = document.querySelector(".dialog-container .talk")
    const modalButtons = document.querySelector(".dialog-container .level-container")

    modalTitle.innerText = header
    modalTalk.innerText = text
    modalButtons.innerHTML = buttons

}

function runTimer(){
    if(gTimerInterval) clearInterval(gTimerInterval)
    gStartTime = Date.now()
    gTimerInterval = setInterval(timer,1000)
}

function timer(){
    const currentTime = Date.now()
    const elapsedTime = (currentTime - gStartTime)
    const seconds = Math.floor(elapsedTime / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60;
    const formattedTime = minutes.toString().padStart(2,0) + ':' + remainingSeconds.toString().padStart(2,0)

    const elTime = document.querySelector(".time-elapsed")
    elTime.innerText = formattedTime;
    return formattedTime
}