let numGuesses = 0;

const solve = board => {
  if (!isBoardValid(board)) {
    alert('invalid board');
    return;
  }

  const simpleResult = simpleSolve(deepCopy(board));

  if (isSolved(simpleResult)) {
    return simpleResult;
  }

  return guessSolve(board, simpleResult, [
    { prevBoard: board, toGuess: simpleResult },
  ]);
};

const simpleSolve = board => {
  let leastNumOfPossibleValues = 10;
  let toGuess;

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (!board[i][j]) {
        const possibleValues = [];
        for (
          let val = 1;
          val <= 9 && possibleValues.length < leastNumOfPossibleValues;
          val++
        ) {
          if (isValid(board, { x: i, y: j, val })) {
            possibleValues.push(val);
          }
        }

        if (!possibleValues.length) {
          return false;
        } else if (possibleValues.length === 1) {
          board[i][j] = possibleValues[0];
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

const guessSolve = (board, toGuess, history = []) => {
  ++numGuesses;
  let leastNumOfPossibleValues = 10;
  let nextGuess;
  let nextBoard;
  let guessedIndex;
  const { x, y, vals } = toGuess;
  for (let i = 0; i < vals.length; i++) {
    const guessedBoard = deepCopy(board);
    guessedBoard[x][y] = vals[i];
    const attemptedResult = simpleSolve(guessedBoard);
    if (isSolved(attemptedResult)) {
      return attemptedResult;
    } else if (attemptedResult) {
      if (attemptedResult.vals.length < leastNumOfPossibleValues) {
        leastNumOfPossibleValues = attemptedResult.vals.length;
        nextGuess = attemptedResult;
        nextBoard = guessedBoard;
        guessedIndex = i;
      }
    }
  }

  if (nextGuess) {
    return guessSolve(nextBoard, nextGuess, [
      ...history,
      { prevBoard: nextBoard, toGuess: nextGuess, guessedIndex },
    ]);
  }

  history.pop();
  let latestHistory = history.at(-1);

  while (latestHistory.toGuess.vals.length < 2) {
    history.pop();
    latestHistory = history.at(-1);
  }

  if (!latestHistory) return 'unsolvable board';
  latestHistory.toGuess.vals.splice(latestHistory.guessedIndex, 1);
  return guessSolve(latestHistory.prevBoard, latestHistory.toGuess, history);
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

const isBoardValid = board => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j]) {
        const resetBoard = deepCopy(board);
        resetBoard[i][j] = 0;
        if (!isValid(resetBoard, { x: i, y: j, val: board[i][j] })) {
          return false;
        }
      }
    }
  }

  return true;
};

const deepCopy = board => board.map(e => [...e]);

const isSolved = result => result?.length;

/** TESTS AREA */

const analyze = board => {
  const analysis = [];
  let variations = 1;
  numGuesses = 0;

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (!board[i][j]) {
        analysis.push(
          [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(val =>
            isValid(board, { x: i, y: j, val })
          )
        );
      } else {
        analysis.push(board[i][j]);
      }
      variations *= analysis.at(-1).length || 1;
    }
  }

  console.log('result: ', solve(board));
  console.log('possible values: ', analysis);
  console.log(`variations: ${variations}`);
  console.log(`complexity: ${numGuesses}`);
};

// difficulty level equals number of needed guesses

// 54
const extraBoard = [
  [0, 8, 0, 1, 0, 0, 0, 2, 0],
  [0, 0, 0, 9, 0, 0, 0, 5, 0],
  [9, 7, 2, 0, 0, 0, 0, 6, 0],
  [4, 0, 0, 0, 2, 6, 0, 0, 0],
  [0, 0, 0, 0, 5, 0, 7, 0, 0],
  [8, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 6, 9, 5, 0, 0, 0],
  [0, 2, 5, 0, 0, 0, 0, 0, 9],
  [0, 0, 0, 0, 4, 0, 0, 0, 1],
];

// 3309
const hardestBoard = [
  [8, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 3, 6, 0, 0, 0, 0, 0],
  [0, 7, 0, 0, 9, 0, 2, 0, 0],
  [0, 5, 0, 0, 0, 7, 0, 0, 0],
  [0, 0, 0, 0, 4, 5, 7, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 3, 0],
  [0, 0, 1, 0, 0, 0, 0, 6, 8],
  [0, 0, 8, 5, 0, 0, 0, 1, 0],
  [0, 9, 0, 0, 0, 0, 4, 0, 0],
];

// 120
const evenHarderBoard = [
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

// 230
const evenHarderBoard2 = [
  [0, 8, 6, 9, 0, 0, 1, 7, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 0, 8, 0, 3, 0, 0, 2],
  [0, 5, 0, 0, 0, 8, 0, 0, 9],
  [0, 0, 2, 0, 6, 0, 0, 0, 0],
  [9, 0, 0, 1, 0, 0, 0, 4, 0],
  [2, 0, 0, 4, 0, 6, 0, 9, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 6, 1, 0, 0, 7, 8, 2, 0],
];

// 41
const harderBoard = [
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

// 8
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

// 1
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

const emptyBoard = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const dummyBoard = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 9, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const invalidBoard = [
  [1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

analyze(extraBoard);

// TODO: sodoku generator
