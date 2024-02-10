"use strict";

const CELL = {
  isMine: false,
  isOpen: false,
  isFlagged: false,
  minesAround: 0,
};

const gGame = {
  isOn: false,
  shownCount: 0,
  flaggedCount: 0,
  elapseTime: 0,
  currLevel: 0,
  levels: [
    {
      name: "Privet",
      field: 16,
      mines: 2,
      difficulty: "Easy",
      bestTime: Infinity,
    },
    {
      name: "Lieutenant",
      field: 64,
      mines: 14,
      difficulty: "Medium",
      bestTime: Infinity,
    },
    {
      name: "Admiral",
      field: 144,
      mines: 32,
      difficulty: "Hard",
      bestTime: Infinity,
    },
  ],
};
const gClicks = { level: 0, total: 0 };

const MINE = "💥";
const EMPTY = " ";
const FLAG = "🚩";
const WIN = "😎";
const LOSE = "😵";

const sounds = {
  whoosh: new Audio("media/audio/whoosh.mp3"),
  blast: new Audio("media/audio/blast.mp3"),
};

let gBoard = [];
let gLives = 3;
let gTimerInterval;
let gStartTime = Date.now();

const gJsConfetti = new JSConfetti();
const gModal = document.querySelector(".modal");

function init(levelIdx, fullReset = false) {
  const field = gGame.levels[levelIdx].field;
  console.log(gGame.levels);
  console.log(isNaN(field));
  CELL.isMine = false;
  gGame.isOn = true;
  gGame.shownCount = 0;
  gGame.flaggedCount = 0;
  gClicks.level = 0;
  closeModal();
  if (fullReset) doReset(levelIdx);
  if (gGame.currLevel === 0) clearInterval(gTimerInterval);

  gBoard = createEmptyBoard(field);
  renderTable(gBoard);
  setLevelName();
  showBestScore();
  addRightClickFunctionality();
}

function doReset(levelIdx = 0) {
  gClicks.total = 0;
  gGame.currLevel = levelIdx;
  if (gTimerInterval) clearInterval(gTimerInterval);
  gLives = 3;
  document.querySelector("p.life-left").innerText = gLives = 3;
  document
    .querySelector(".life-left > .live-data")
    .classList.remove("last-life");
  document.querySelector("p.time-elapsed").innerText = "00:00";
}

///TESTING
function createEmptyBoard(field = 16) {
  gBoard = [];
  for (let i = 0; i < Math.sqrt(field); i++) {
    gBoard.push([]);
    for (let j = 0; j < Math.sqrt(field); j++) {
      gBoard[i][j] = structuredClone(CELL);
    }
  }
  return gBoard;
}

function placeMines(iPos, jPos) {
  const level = gGame.levels[gGame.currLevel];
  let mines = level.mines;
  while (mines > 0) {
    const randI = getRandomInt(0, gBoard.length);
    const randJ = getRandomInt(0, gBoard.length);
    if (gBoard[randI][randJ].isMine) continue;
    if (randI === iPos && randJ === jPos) continue;
    gBoard[randI][randJ].isMine = true;
    mines--;
  }
  return gBoard;
}

function CheckIfFirstMove(iPos, jPos) {
  if (gClicks.level >= 1) return;
  const updatedMap = placeMines(iPos, jPos);
  addMineCount();
  renderTable(updatedMap);
  runTimer();
  addRightClickFunctionality();
}

//END TESTING

function addMineCount() {
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[0].length; j++) {
      const nbr = totalMines(i, j);
      gBoard[i][j].minesAround = nbr;
    }
  }
}

function renderTable(twoDArr) {
  const len = twoDArr.length;
  let htmlTable = "";
  for (let i = 0; i < len; i++) {
    htmlTable += "<tr>";
    for (let j = 0; j < len; j++) {
      const currCell = twoDArr[i][j];
      htmlTable += `<td id="p${i}at${j}" onclick="play(this, ${i}, ${j})"></td>`
    //   $ {
    //     //currCell.isMine ? MINE : EMPTY
    //   } </td> `;
    }
    htmlTable += "</tr>";
  }
  document.querySelector("table").innerHTML = htmlTable;
}

function totalMines(iPos, jPos) {
  let nbrCount = 0;
  for (let i = iPos - 1; i <= iPos + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (let j = jPos - 1; j <= jPos + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      if (i === iPos && j === jPos) continue;
      if (gBoard[i][j].isMine) nbrCount++;
    }
  }
  return nbrCount;
}

function play(elm, iPos, jPos) {
  const currCell = gBoard[iPos][jPos];
  if (currCell.isOpen) return;
  if (currCell.isFlagged) return;
  if (!gGame.isOn) return;
  if (gClicks.level < 1) {
    CheckIfFirstMove(iPos, jPos);
    elm = document.querySelector(`#p${iPos}at${jPos}`);
  }
  gGame.shownCount++;

  if (!elm.classList) elm = document.querySelector(`#p${iPos}at${jPos}`);
  currCell.isOpen = true;
  elm.classList.add("open");
  if (currCell.isMine) {
    elm.innerText = MINE
    sounds.blast.play();
    checkLose();
  } else {
    var nbrCount = currCell.minesAround;
    if (nbrCount > 0) {
      elm.innerHTML = `<div class="has-${nbrCount}-neighbors">${nbrCount}</div>`;
    } else {
      sounds.whoosh.play();
      clearArea(iPos, jPos);
    }
    checkWin();
  }

  gClicks.level++;
}

function clearArea(iPos, jPos) {
  for (let i = iPos - 1; i <= iPos + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (let j = jPos - 1; j <= jPos + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      if (i === iPos && j === jPos) continue;
      setTimeout(() => {
        play({ notObj: "" }, i, j);
      }, 200);
    }
  }
}

function flag(elm) {
  const pos = getPosFromId(elm.id);
  const CurrCell = gBoard[pos.i][pos.j];
  if (gClicks.level < 1 && gClicks.total < 1) {
    CheckIfFirstMove(
      gGame.levels[gGame.currLevel].field,
      gGame.levels[gGame.currLevel].mines,
      pos.i,
      pos.j
    );
    elm = document.querySelector(`#p${pos.i}at${pos.j}`);
  }
  if (CurrCell.isOpen) return;
  elm.classList.toggle("flagged");
  if (CurrCell.isFlagged) {
    CurrCell.isFlagged = false;
    elm.innerText = CurrCell.isMine ? MINE : EMPTY;
    gGame.flaggedCount--;
  } else {
    CurrCell.isFlagged = true;
    elm.innerText = FLAG;
    gGame.flaggedCount++;
    checkWin();
  }

  gClicks.level++;
}

function getPosFromId(str) {
  return {
    i: +str.slice(1, isNaN(+str[2]) ? 2 : 3),
    j: +str.slice(str.indexOf("at") + 2),
  };
}

function checkLose() {
  if (gLives <= 1) {
    lose();
  } else {
    checkWin();
  }
  gLives--;
  document.querySelector("p.life-left").innerText = gLives;
  if (gLives === 1) {
    document
      .querySelector(".life-left > .live-data")
      .classList.add("last-life");
  }
}

function lose() {
  const modalTitle = document.querySelector(".dialog-container h3");
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[0].length; j++) {
      const cell = gBoard[i][j];
      if (cell.isMine) {
        cell.isOpen = true;
        cell.isFlagged = false;
        const elCell = document.querySelector(`#p${i}at${j}`);
        elCell.innerText = MINE
        elCell.classList.add("open");
        elCell.classList.remove("flagged");
      }
    }
  }
  emoji(LOSE);
  const levelData = gGame.levels[gGame.currLevel];
  const modalBtn = `<button class="level-picker" title="${levelData.difficulty}" onclick="init(0,true)">Start again</button>`;
  setTimeout(() => {
    modalSetUp(
      "Game Over",
      "you have lost the game\nYou may starts again from the beginning",
      modalBtn
    );
    modalTitle.innerText = "Game Over";
    gModal.showModal();
  }, 1000);
  endGame(true);
}

function checkWin() {
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[0].length; j++) {
      if (
        gBoard[i][j].isMine &&
        !gBoard[i][j].isFlagged &&
        !gBoard[i][j].isOpen
      )
        return;
      if (!gBoard[i][j].isMine && !gBoard[i][j].isOpen) return;
    }
  }
  win();
}

function win() {
  const time = timer();
  const levelIdx = gGame.currLevel;
  if (levelIdx === gGame.levels.length - 1) {
    finishGame(time);
    return;
  }
  gGame.currLevel++;
  const currLevel = gGame.levels[gGame.currLevel];
  const modalTitle = "You've been promoted to " + currLevel.name;
  const modalTalk =
    "You've cleared the field in " +
    time +
    "\nyou may continue to the next level";
  const modalButtons = `<button class="level-picker" title="${currLevel.difficulty}" onclick="init(${gGame.currLevel},false)">PLAY ${currLevel.difficulty}</button>`;
  emoji(WIN);

  modalSetUp(modalTitle, modalTalk, modalButtons);
  gModal.showModal();
  endGame(false);
  checkIfNewBest(levelIdx, time);
}

function finishGame(time) {
  const title = "WELL DONE SOLDIER!";
  const talk =
    "You have cleared 3 fields in just " + time + "\nThat is impressive";
  let allLevels = "";
  for (let i = 0; i < gGame.levels.length; i++) {
    const level = gGame.levels[i];
    allLevels += `<button class="level-picker" title="${level.difficulty}" onclick="init(${i},true)">${level.name}</button>`;
  }
  endGame(true);
  modalSetUp(title, talk, allLevels);
  gModal.showModal();
  gJsConfetti.addConfetti();
}

function openModal() {
  gModal.showModal();
}

function closeModal() {
  gModal.close();
}

function endGame(killInterval = false) {
  gClicks.total += gClicks.level;
  if (killInterval) clearInterval(gTimerInterval);
}

function checkIfNewBest(levelIdx, time) {
  let bestTime = gGame.levels[levelIdx].bestTime;
  if (isNaN(bestTime))
    bestTime = +(+bestTime.substring(0, 2) * 60 + bestTime.substring(3));

  const timeToSeconds = +(+time.substring(0, 2) * 60 + time.substring(3));

  if (timeToSeconds < bestTime) {
    gGame.levels[levelIdx].bestTime = time;
    saveToLocal(levelIdx);
    console.log("new Best " + time);
  }

  gJsConfetti.addConfetti();
}

function saveToLocal(levelIdx) {
  //localStorage.level+ = structuredClone(gGame.levels)
  localStorage.setItem("bestTimes", JSON.stringify(gGame.levels));
  console.log("saved");
  //retrieve Method JSON.parse(localStorage.bestTimes)
}
