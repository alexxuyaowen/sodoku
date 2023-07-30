const solve = board => {
  const simpleResult = simpleSolve(deepCopy(board));

  if (isSolved(simpleResult)) {
    return simpleResult;
  }

  return guessSolve(board, simpleResult);
};

const simpleSolve = board => {
  const map = new Map();

  let leastNumOfPossibleValues = 9;
  let toGuess;

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
          return false;
        } else if (possibleValues.length === 1) {
          board[i][j] = map.get(pos1D)[0];
          return simpleSolve(board);
        } else if (possibleValues.length < leastNumOfPossibleValues) {
          leastNumOfPossibleValues = possibleValues.length;
          toGuess = { x: i, y: j, vals: possibleValues };
        }
      }
    }
  }

  return toGuess || board;
};

const guessSolve = (board, toGuess, guessed = []) => {
  const { x, y, vals } = toGuess;
  for (let i = 0; i < vals.length; i++) {
    const guessedBoard = deepCopy(board);
    guessedBoard[x][y] = vals[i];
    const attemptResult = simpleSolve(guessedBoard);
    if (isSolved(attemptResult)) {
      return attemptResult;
    } else if (attemptResult) {
      return guessSolve(guessedBoard, attemptResult, [
        ...guessed,
        attemptResult,
      ]);
    }
  }

  guessed.pop();
  board[x][y] = 0;
  const prevGuess = { ...guessed.at(-1) };
  prevGuess.vals.shift();
  return guessSolve(board, prevGuess, guessed);
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

const deepCopy = obj => JSON.parse(JSON.stringify(obj));

const isSolved = result => result?.length;

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