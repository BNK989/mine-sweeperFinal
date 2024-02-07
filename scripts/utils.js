'use strict'

function getRandomInt(min = 1, max = 10) {
    const minCeiled = Math.ceil(min)
    const maxFloored = Math.floor(max)
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}
  
function createGrid(num){
    const gridSize = Math.sqrt(num)
    gGrid.length = 0
    for(let i = 0 ; i < gridSize; i++){
        gGrid.push([])
        for(let j = 0 ; j < gridSize; j++){
            gGrid[i][j] = getRandom()
        }
    }
}

function getRandomColor(){
    const colors = ['red', 'orange','turquoise','pink']
}

function pickrandomElement(arr){
    if(!arr) return
    const randIndx = getRandomIntInclusive(0,arr.length-1)
    return arr[randIndx]
}

function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex
  
    while (currentIndex > 0) {
  
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]]
    }
  
    return array
  }