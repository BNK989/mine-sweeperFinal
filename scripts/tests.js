class Builder {
    constructor(cells, mines) {
      this.cells = cells;
      this.mines = mines;
    }
    // Getter
    get area() {
      return this.calcArea();
    }
    // Method
    calcArea() {
      return this.height * this.width;
    }
    //my getter
    get emptyBoard() {
        return this.createEmptyBoard()
    }
    // my method
    createEmptyBoard(){
        const area = Math.sqrt(this.cells)
        const board = []
        for (let i = 0; i < area; i++) {
            board.push([])
            for (let j = 0; j < area; j++) {
                board[i][j] = ''
            }
        }
        return board    
    }

    *getSides() {
      yield this.height;
      yield this.width;
      yield this.height;
      yield this.width;
    }
  }

  const test2dArr = new Builder(16, 2);

  console.log(test2dArr)