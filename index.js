let step = 0;

const solve = board => {
  return solveGuess(board);
};

const solveGuess = (board, guessed = {}) => {
  // console.log(board, guessed);
  const map = new Map();
  const nextBoard = JSON.parse(JSON.stringify(board));
  let leastNumOfPossibleValues = 9;
  let toGuess = { x: 0, y: 0 };

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const pos1D = i * 9 + j;
      if (board[i][j]) {
        map.set(pos1D, board[i][j]);
      } else {
        for (let val = 1; val <= 9; val++) {
          if (isValid(board, { x: i, y: j, val })) {
            map.set(pos1D, map.has(pos1D) ? [...map.get(pos1D), val] : [val]);
          }
        }

        const possibleValues = map.get(pos1D);

        if (!possibleValues) {
          // console.log(board, map, possibleValues, '????');
          // console.log(`${i}-${j}: Invalid board!`);
          return false;
        } else if (possibleValues.length === 1) {
          nextBoard[i][j] = map.get(pos1D)[0];
          // console.log(`step ${++step}: ${i}-${j} ${nextBoard[i][j]}`);
          return solveGuess(nextBoard, guessed);
        } else if (possibleValues.length < leastNumOfPossibleValues) {
          leastNumOfPossibleValues = possibleValues.length;
          toGuess = { x: i, y: j, val: possibleValues };
        }
      }
    }
  }

  if (toGuess.val) {
    for (let i = 0; i < leastNumOfPossibleValues; i++) {
      const guessedBoard = JSON.parse(JSON.stringify(board));
      guessedBoard[toGuess.x][toGuess.y] = toGuess.val[i];
      const result = solveGuess(guessedBoard, { ...toGuess, currIndex: i });
      if (result) {
        return result;
      }
    }

    nextBoard[guessed.x][guessed.y] = guessed.val[guessed.currIndex + 1] || 0;
    return solveGuess(nextBoard, {
      ...guessed,
      currIndex: guessed.currIndex + 1,
    });
  }

  return board;
};

const isValid = (board, { x, y, val }) => {
  for (let i = 0; i < 9; i++) {
    if (board[x][i] === val || board[i][y] === val) return false;
  }

  const [boxX, boxY] = [x - (x % 3), y - (y % 3)];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxX + i][boxY + j] === val) return false;
    }
  }

  return true;
};

const harderBoard1 = [
  [8, 0, 0, 0, 0, 5, 2, 0, 0],
  [0, 0, 0, 0, 6, 0, 0, 3, 0],
  [9, 0, 0, 0, 0, 0, 5, 0, 0],
  [0, 7, 3, 0, 0, 0, 0, 6, 0],
  [0, 0, 0, 0, 2, 8, 0, 0, 5],
  [0, 5, 0, 6, 0, 0, 0, 0, 0],
  [0, 2, 0, 0, 0, 0, 0, 0, 9],
  [4, 0, 0, 0, 0, 0, 0, 0, 8],
  [0, 0, 6, 7, 3, 0, 0, 2, 0],
];

const harderBoard2 = [
  [0, 8, 6, 9, 0, 0, 1, 7, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 0, 8, 0, 3, 0, 0, 2],
  [0, 5, 0, 0, 0, 8, 0, 0, 9],
  [0, 0, 2, 0, 6, 0, 3, 0, 0],
  [9, 0, 0, 1, 0, 0, 0, 4, 0],
  [2, 0, 0, 4, 0, 6, 0, 9, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 6, 1, 0, 0, 7, 8, 2, 0],
];

const hardBoard = [
  [7, 0, 0, 0, 0, 4, 0, 2, 0],
  [0, 9, 0, 0, 0, 0, 3, 0, 0],
  [0, 0, 0, 0, 0, 6, 0, 0, 8],
  [0, 8, 0, 9, 0, 0, 0, 0, 0],
  [0, 3, 5, 0, 0, 0, 0, 0, 9],
  [0, 0, 0, 0, 7, 2, 0, 4, 0],
  [0, 0, 9, 5, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 8, 6, 7],
  [1, 0, 0, 3, 0, 0, 0, 0, 0],
];

const mediumBoard = [
  [0, 5, 0, 0, 6, 4, 7, 3, 2],
  [0, 7, 0, 5, 0, 0, 4, 0, 8],
  [4, 0, 0, 0, 8, 0, 0, 6, 0],
  [0, 0, 0, 0, 2, 9, 0, 5, 0],
  [2, 0, 4, 0, 0, 7, 1, 9, 0],
  [0, 0, 5, 3, 0, 0, 0, 0, 7],
  [0, 0, 0, 0, 0, 0, 0, 7, 0],
  [7, 0, 0, 0, 0, 0, 9, 4, 6],
  [6, 0, 0, 0, 0, 0, 8, 0, 5],
];

const easyBoard = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

solve(harderBoard1);
