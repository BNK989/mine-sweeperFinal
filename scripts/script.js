'use strict'

const CELL = {
    isMine: false,
    isOpen: false,
    isFlagged: false,
    minesAround: 0
}

const gGame = {
    isOn: false,
    shownCount: 0,
    flaggedCount: 0,
    elapseTime: 0,
    levels: [{
     isCurrent: true, name: 'Privet', function: 'init(16,2)', difficulty: 'Easy' },
    {isCurrent: false, name: 'Lieutenant', function: 'init(64,14)', difficulty: 'Medium' },
    {isCurrent: false, name: 'Admiral', function: 'init(144,32)', difficulty: 'Hard' }]
}

const gBestScore = {
    16: Infinity,
    25: Infinity,
    36: Infinity
}

const MINE = 'M'
const EMPTY = 'E'
const FLAG = '🚩'

let gBoard = []
let gClicks = 0
let gLives = 3
let gTimerInterval
let gStartTime = Date.now()

const gJsConfetti = new JSConfetti()
const gModal = document.querySelector(".modal")



let gCurrLevel = 16

function init(field,mines){
    CELL.isMine = false
    gGame.isOn = true
    gGame.shownCount = 0
    gGame.flaggedCount = 0
    gGame.level = field
    gClicks = 0
    closeModal()
    clearInterval(gTimerInterval)

    gBoard = createBoardFromArray(createMines(field,mines))
    renderTable(gBoard)
    addMineCount()
    addRightClickFunctionality()
    
}

function addRightClickFunctionality(){
    const allTds = document.querySelectorAll('td')
    allTds.forEach((td)=> {
        td.addEventListener('contextmenu', function(ev) {
            ev.preventDefault()
            flag(this)
        })
    })
}

function createMines(field = 16, mines = 2){
    const arr = []
    for(let i = 0; i < field; i++){
        if(i < field - mines){
            arr.push(structuredClone(CELL))
        } else {
            CELL.isMine = true
            arr.push(structuredClone(CELL))
        }
    }
    let temp1 = arr
    shuffle(arr)
    let temp2 = arr
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

function addMineCount(){
    for(let i = 0 ; i < gBoard.length ; i++){
        for(let j = 0 ; j < gBoard[0].length ; j++){
            const nbr = totalMines(i,j)
            gBoard[i][j].minesAround = nbr
        }
    }
    console.table(gBoard)
}

function renderTable(twoDArr){
    const len = twoDArr.length
    let htmlTable = ''
    for(let i = 0 ; i < len; i++){
        htmlTable += '<tr>'
        for(let j = 0 ; j < len; j++){
            const currCell = twoDArr[i][j]
            htmlTable += `<td id="p${i}at${j}" onclick="play(this, ${i}, ${j})"> ${currCell.isMine ? MINE : EMPTY} </td>`
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
            if (gBoard[i][j].isMine) nbrCount++;
        }
    }
    return nbrCount
}

function play(elm,iPos,jPos){

    const currCell = gBoard[iPos][jPos]
    if(currCell.isOpen) return
    if(currCell.isFlagged) return
    currCell.isOpen = true
    gGame.shownCount++
    if(gClicks < 1) runTimer()
    
    if (currCell.isMine){
            elm.classList.add("open")
            if(gClicks < 1 || gGame.shownCount <= 1){
                oops(elm,iPos,jPos)
                console.log('oops')
                return
            }else{
                checkLose()
                console.log('lose')
            }
        } else {

                var nbrCount = currCell.minesAround
                if(!elm.classList) elm = document.querySelector(`#p${iPos}at${jPos}`)
                elm.classList.add("open")
                if (nbrCount > 0) {
                    elm.innerHTML = `<div class="has-${nbrCount}-neighbors">${nbrCount}</div>`
                } else {
                    clearArea(iPos,jPos)
                }
                checkWin()
        }
            
        gClicks++
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
    const CurrCell = gBoard[pos.i][pos.j]
    if(CurrCell.isOpen) return
    if(CurrCell.isFlagged){
        CurrCell.isFlagged = false
        elm.innerText = CurrCell.isMine ? MINE : EMPTY
        gGame.flaggedCount--
     } else {
        CurrCell.isFlagged = true
        elm.innerText = FLAG
        gGame.flaggedCount++
        checkWin()
     }

     if(gClicks < 1 )  runTimer()
     gClicks++

}

function getPosFromId(str){
    return {
    i: +str.slice(1, isNaN(+str[2]) ? 2 : 3 ),
    j: +str.slice(str.indexOf('at')+2)
    }
}

function oops(elm,iPos,jPos){
    
    while(gBoard[iPos][jPos].isMine){
        const randI = getRandomInt(0,gBoard.length)
        const randJ = getRandomInt(0,gBoard.length)
        
        if (!gBoard[randI][randJ].isMine){//if found empty
            const holdThis = gBoard[randI][randJ]//empty
            gBoard[randI][randJ] = gBoard[iPos][jPos]//place mine in empty
            gBoard[iPos][jPos] = holdThis
            //swapped done
            gBoard[randI][randJ].isOpen = false
            gGame.shownCount--
            
            //DOM
            const newElm = document.querySelector(`#p${randI}at${randJ}`)
            elm.innerText = EMPTY
            newElm.innerText = MINE
            play(elm,iPos,jPos)
        }
    }
}

function checkLose(){
    if(gLives <= 0){
        lose()
    } else {
        gLives--
    }
}

function lose(){
    const modalTitle = document.querySelector(".modal .container h3")
    //new Audio("media/wrong.wav").play()
    for(let i = 0 ; i < gBoard.length ; i++){
        for(let j = 0 ; j < gBoard[0].length ; j++){
            if (gBoard[i][j].isMine){
                gBoard[i][j].isOpen = true
                document.querySelector(`#p${i}at${j}`).classList.add("open")
            }
        }
    }
    setTimeout(()=>{
        modalTitle.innerText = 'Game Over'
        gModal.showModal()
    },1000)
}

function checkWin(){

    for(let i = 0; i < gBoard.length; i++){
        for(let j = 0; j < gBoard[0].length; j++){
            if(gBoard[i][j].isMine && !gBoard[i][j].isFlagged && !gBoard[i][j].isOpen) return
            if(!gBoard[i][j].isMine && !gBoard[i][j].isOpen) return
        }
    }
    win()
    
}

function win(){
    const modalTitle = document.querySelector(".dialog-container h3")
    const modalTalk = document.querySelector(".dialog-container .talk")
    const modalButtons = document.querySelector(".dialog-container .level-container")
    const time = timer()
    //clearInterval(gInterval)
    modalTitle.innerText = 'At ease soldier'
    modalTalk.innerText = 'You\'ve cleared the field in ' + time + '\nyou may continue to the next level'
    modalButtons.innerHTML = '<button class="level-picker" title="Hard" onclick="init(144,32)">Admiral</button>'
    gModal.showModal()
    endGame()
    gJsConfetti.addConfetti()
    if (time < gBestScore[gCurrLevel]) newBest(time) 
}

function openModal(){
    gModal.showModal()
}

function closeModal(){
    gModal.close()
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
function endGame(){
    clearInterval(gTimerInterval)
}
//======================================================================================//


function newBest(bestTime){
    //also include level
    console.log('New best' + gCurrLevel)
    gBestScore[gCurrLevel] = bestTime;
    const elModalTitle = document.querySelector(".modal .container h3")
    const elBestTime = document.querySelector("span.best-time")

    elModalTitle.innerText = 'New Record!: ' + bestTime + 's'
    elBestTime.innerText = bestTime

}
