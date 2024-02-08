'use strict'

function setLevelName(){
    const level = gGame.levels.find((level)=> level.isCurrent)
    const nameArea = document.querySelector('.level-name')

    nameArea.innerText = level.name
}