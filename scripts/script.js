'use strict'

const MINE = {
    type: 'B',
    isOpen: false,
    isFlagged: false
}
const EMPTY = {
    type: 'E',
    isOpen: false,
    isFlagged: false
}

let gBoard = []
let gClicks = 0
let gLives = 3

let gRecInterval

const gNumbers = []
let gStartTime = Date.now()
const gModal = document.querySelector(".modal")
let gInterval;
const gNextMoveElm = document.querySelector("span.next-num")
const gElTime = document.querySelector(".timer")
const gJsConfetti = new JSConfetti()
let gBestScore = {
    16: Infinity,
    25: Infinity,
    36: Infinity
}
let gCurrLevel = 16

function init(field,mines){

    gBoard = createBoardFromArray(createMines(field,mines))
    renderTable(gBoard)

    const allTds = document.querySelectorAll('td')
    allTds.forEach((td)=> {
        td.addEventListener('contextmenu', function(ev) {
            ev.preventDefault()
            flag(this)
        })
    })

    gClicks = 0
    gLives = 3
    if(gRecInterval) clearInterval(gRecInterval)
}

function createMines(field = 16, mines = 2){
    const arr = []
    for(let i = 0; i < field; i++){
        if(i < field - mines){
            arr.push(structuredClone(EMPTY))
        } else {
            arr.push(structuredClone(MINE))
        }
    }
    shuffle(arr)
    return arr
}

function createBoardFromArray(arr) {
    const board = []
    const len = arr.length
    const size = Math.sqrt(len)

    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = arr.shift()
        }
    }
    return board
}

function renderTable(twoDArr){
    const len = twoDArr.length
    //const gridSize = Math.sqrt(len)
    let htmlTable = ''
    for(let i = 0 ; i < len; i++){
        htmlTable += '<tr>'
        for(let j = 0 ; j < len; j++){
            const currCell = twoDArr[i][j]
            htmlTable += `<td id="p${i}at${j}" onclick="play(this, ${i}, ${j})"> ${currCell.type} </td>`
        }
        htmlTable += '</tr>'
    }
    document.querySelector("table").innerHTML = htmlTable
}

function totalMines(iPos,jPos){
    let nbrCount = 0;
    for (let i = iPos - 1; i <= iPos + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (let j = jPos - 1; j <= jPos + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === iPos && j === jPos) continue;
            const currCellType = gBoard[i][j].type
            if (currCellType === MINE.type) nbrCount++;
        }
    }
    return nbrCount
}

function play(elm,iPos,jPos){

    const cell = gBoard[iPos][jPos]
    if(cell.isOpen) return
    if(cell.isFlagged) return
    
    switch (cell.type){
        case MINE.type:
            if(gClicks < 1){
                //oops(elm,iPos,jPos)
                console.log('oops')
                return
            }else{
                gLives--
                checkLose()
                console.log('lose')
            }
            break

            case EMPTY.type:
                var nbrCount = totalMines(iPos,jPos)
                if(!elm.classList) elm = document.querySelector(`#p${iPos}at${jPos}`)
                elm.classList.add("open")
                if (nbrCount > 0) {
                    elm.innerHTML = `<div class="has-${nbrCount}-neighbors">${nbrCount}</div>`
                } else {
                    gRecInterval = setInterval(clearArea,150,iPos,jPos)
                return
                
            }
            break
            default:
                console.error('issue')
            } 
            
        cell.isOpen = true
        gClicks++
        if(gRecInterval) clearInterval(gRecInterval)
}

function clearArea(iPos,jPos){

    
    for (let i = iPos - 1; i <= iPos + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (let j = jPos - 1; j <= jPos + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === iPos && j === jPos) continue;
            play({notObj: ''},i,j)
        }
    }
}

function flag(elm){
    const pos = getPosFromId(elm.id)
    const cell = gBoard[pos.i][pos.j]
    if(cell.isOpen) return
    if(cell.isFlagged){
        cell.isFlagged = false
        elm.innerText = cell.type
     } else {
        cell.isFlagged = true
        elm.innerText = '🚩'
     }

}

function getPosFromId(str){
    return {
    i: +str.slice(1, isNaN(+str[2]) ? 2 : 3 ),
    j: +str.slice(str.indexOf('at')+2)
    }
}

function oops(elm,iPos,jPos){ //save a user on first click
//find an empty cell 
console.log('oops')
    
    while(gBoard[iPos][jPos].type === MINE.type && gClicks < 99){
        const randI = getRandomInt(0,gBoard.length)
        const randJ = getRandomInt(0,gBoard.length)
        
        if (gBoard[randI][randJ].type === EMPTY.type){//if found empty
            const holdThis = gBoard[randI][randJ]//empty
            gBoard[randI][randJ] = gBoard[iPos][jPos]//place mine in empty
            gBoard[iPos][jPos] = holdThis
            
            const newElm = document.querySelector(`#p${randI}at${randJ}`)

            //play(newElm,iPos,jPos)
            
            
            return
            //if(gClicks > 999)return
            //DOM
            // elm.innerText = EMPTY.type
            // elm.classList.add("open")
            // document.querySelector(`#p${i}at${i}`).innerText = gBoard[i][i].type
        }
    }
}


function checkLose(){
    console.log('function checkLose not created')
    if(gLives <= 0) lose()
}

function lose(){
    const modalTitle = document.querySelector(".modal .container h3")
    new Audio("./media/wrong.wav").play()
    modalTitle.innerText = 'Game Over'
    gModal.showModal()
    clearInterval(gInterval)
}


///OLD...==================================================OLD=========OLD=========OLD=========OLD=========OLD=========OLD=========OLD=========OLD=========OLD=====



function runTimer(){
    gStartTime = Date.now()
    gInterval = setInterval(timer,30)
}

function timer(){
    const currentTime = Date.now()
    const elapstTime = (currentTime - gStartTime) / 1000
    const formattedTime = elapstTime.toFixed(3)
    gElTime.innerText = formattedTime;
    return formattedTime
}


function win(){
    const modalTitle = document.querySelector(".modal .container h3")
    const time = +timer()
    clearInterval(gInterval)
    gJsConfetti.addConfetti()
    modalTitle.innerText = 'DONE! in: ' + time + 's'
    gModal.showModal()

    if (time < gBestScore[gCurrLevel])  newBest(time) 
}

function gameOver(){
    //shuts the game --> should be executable from win or lose.
}

function closeModal(){
    gModal.close()
}

function newBest(bestTime){
    //also include level
    console.log('New best' + gCurrLevel)
    gBestScore[gCurrLevel] = bestTime;
    const elModalTitle = document.querySelector(".modal .container h3")
    const elBestTime = document.querySelector("span.best-time")

    elModalTitle.innerText = 'New Record!: ' + bestTime + 's'
    elBestTime.innerText = bestTime

}
