/* eslint-disable */
const solve = (board) => {
  if (!isBoardValid(board)) {
    return "invalid board";
  }

  const steps = [];

  const { toGuess, simpleSolvedBoard } = simpleSolve(board, steps);

  if (!simpleSolvedBoard) {
    return { board: "unsolvable board" };
  }

  if (toGuess) {
    return guessSolve(
      simpleSolvedBoard,
      toGuess,
      [{ prevBoard: simpleSolvedBoard, toGuess }],
      steps
    );
  }

  return { board: simpleSolvedBoard, steps };
};

const simpleSolve = (board, steps) => {
  const simpleSolvedBoard = deepCopy(board);
  const simpleSolvedSteps = deepCopy(steps);
  let needGuess = true;

  while (needGuess) {
    const notes = [];

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const box = ((i / 3) | 0) * 3 + ((j / 3) | 0);
        if (!simpleSolvedBoard[i][j]) {
          const possibleValues = new Set();
          for (let val = 1; val <= 9; val++) {
            if (isValid(simpleSolvedBoard, { x: i, y: j, val })) {
              possibleValues.add(val);
            }
          }

          if (!possibleValues.size) {
            return false;
          } else {
            notes.push({
              vals: possibleValues,
              row: i,
              col: j,
              box,
            });
          }
        } else {
          notes.push({
            row: i,
            col: j,
            box,
          });
        }
      }
    }

    for (let i = 0; i < 9; i++) {
      const results = [
        check(notes.filter(({ row }) => row === i)),
        check(notes.filter(({ col }) => col === i)),
        check(notes.filter(({ box }) => box === i)),
      ];

      for (const result of results) {
        for (const found of result) {
          const { x, y, val } = found;
          needGuess = false;
          if (!simpleSolvedBoard[x][y]) {
            simpleSolvedBoard[x][y] = val;
            simpleSolvedSteps.push({
              step: simpleSolvedSteps.length + 1,
              ...found,
            });
          }
        }
      }
    }

    if (needGuess) {
      steps.push(...simpleSolvedSteps);
      if (!isSolved(simpleSolvedBoard)) {
        for (let i = 2; i < 9; i++) {
          const toGuess = notes.find((note) => note.vals?.size === i);
          if (toGuess) {
            return {
              toGuess: {
                x: toGuess.row,
                y: toGuess.col,
                vals: [...toGuess.vals],
              },
              simpleSolvedBoard,
            };
          }
        }
      }
      return { simpleSolvedBoard };
    }

    needGuess = true;
  }
};

const guessSolve = (board, toGuess, history = [], steps) => {
  while (true) {
    const { x, y, vals } = toGuess;
    if (vals.length) {
      const guessedBoard = deepCopy(board);
      guessedBoard[x][y] = vals[0];

      const simpleSolvedSteps = [];
      const { toGuess: nextGuess, simpleSolvedBoard } = simpleSolve(
        guessedBoard,
        simpleSolvedSteps
      );

      if (isSolved(simpleSolvedBoard)) {
        for (const h of history) {
          steps.push({
            step: steps.length + 1,
            x: h.toGuess.x,
            y: h.toGuess.y,
            val: h.toGuess.vals[0],
            needGuess: true,
          });
          const simpleSteps = h.simpleSolvedSteps?.map((step) => ({
            ...step,
            step: step.step + steps.length,
          }));
          if (simpleSteps) {
            steps.push(...simpleSteps);
          }
        }

        const simpleSteps = simpleSolvedSteps?.map((step) => ({
          ...step,
          step: step.step + steps.length,
        }));
        if (simpleSteps) {
          steps.push(...simpleSteps);
        }

        return {
          board: simpleSolvedBoard,
          steps,
        };
      } else if (nextGuess) {
        board = simpleSolvedBoard;
        toGuess = nextGuess;
        history.push({
          prevBoard: simpleSolvedBoard,
          toGuess: nextGuess,
          simpleSolvedSteps,
        });
      } else {
        vals.shift();
      }
    } else {
      history.pop();
      let latestHistory = history.at(-1);

      while (latestHistory?.toGuess.vals.length === 1) {
        history.pop();
        latestHistory = history.at(-1);
      }

      if (!latestHistory) return { board: "unsolvable board" };
      latestHistory.toGuess.vals.shift();
      board = latestHistory.prevBoard;
      toGuess = latestHistory.toGuess;
    }
  }
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

const isBoardValid = (board) => {
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

const deepCopy = (arr) =>
  arr.map((e) => (Array.isArray(e) ? [...e] : { ...e }));

const isSolved = (board) => Array.isArray(board) && !board.flat().includes(0);

const check = (arr) => {
  const valuesCount = new Array(10).fill(0);
  const result = [];

  for (const obj of arr) {
    const { row: x, col: y, vals } = obj;
    if (vals) {
      // uniqueness check
      if (vals.size === 1) {
        const val = vals.values().next().value;
        result.push({ x, y, val });
        valuesCount[val] = -10;
      } else {
        vals.forEach((val) => valuesCount[val]++);
      }
    }
  }

  for (let val = 1; val <= 9; val++) {
    // exhaustiveness check
    if (valuesCount[val] === 1) {
      const { row: x, col: y } = arr.find((obj) => obj.vals?.has(val));
      result.push({ x, y, val, isExhaustive: true });
    }
  }

  return result;
};

/** TESTS AREA */

const analyze = (board) => {
  let result = {};
  const startTime = Date.now();

  try {
    result = solve(board);
  } catch (e) {
    console.error(e);
  } finally {
    console.log(`\ntime spent: ${Date.now() - startTime}ms`);
    console.log("result:", result.board);
    console.log("steps:", result.steps);
    console.log("original board:", board);
    console.log(
      "uncertainty level: ",
      result.steps?.reduce((count, step) => count + !!step.needGuess, 0)
    );
  }
};

// board[2][4] should not be 8
const unsolvableBoard = [
  [0, 8, 0, 1, 0, 0, 0, 2, 0],
  [0, 0, 0, 9, 0, 0, 0, 5, 0],
  [9, 7, 2, 0, 8, 0, 0, 6, 0],
  [4, 0, 0, 0, 2, 6, 0, 0, 0],
  [0, 0, 0, 0, 5, 0, 7, 0, 0],
  [8, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 6, 9, 5, 0, 0, 0],
  [0, 2, 5, 0, 0, 0, 0, 0, 9],
  [0, 0, 0, 0, 4, 0, 0, 0, 1],
];

const unsolvableBoard2 = [
  [0, 8, 0, 1, 7, 0, 0, 2, 0],
  [0, 0, 0, 9, 0, 0, 0, 5, 0],
  [9, 7, 2, 0, 3, 0, 0, 6, 0],
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

// 8-0 should be 6
const exhaustiveBoard = [
  [0, 0, 6, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 6, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [5, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 6, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// 8-0 should be 6
const exhaustiveBoard2 = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 6, 0, 0, 0, 0],
  [3, 0, 2, 0, 0, 0, 0, 0, 0],
  [2, 0, 3, 0, 0, 0, 0, 0, 0],
  [1, 0, 4, 0, 0, 0, 0, 0, 0],
  [0, 0, 5, 0, 0, 0, 0, 0, 0],
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

// http://www.sudokufans.org.cn/forums/topic/438/
const hardestBoardCodes = [
  "016300000008000000490070200000057000000040900050100060081000030000000008900005700", // 3675
  "000000800002070040000300601600100005009040000000057000007005090300000108080000000", // 7051
  "061300000400070020080000000005100600000040090000057000000000008018000300900005070", // 7974
  "090000004100000860800005010000001030000540007050700000300006000070090002008000000", // 2462
  "007090002300006000080000000005700000000540007000001300009000004800005100100000680", // 3850
];

const toBoard = (code) => {
  const board = deepCopy(emptyBoard);
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      board[i][j] = +code[i * 9 + j];
    }
  }
  return board;
};

// analyze(exhaustiveBoard2);

for (const code of hardestBoardCodes) {
  analyze(toBoard(code));
}

/** Features */

// 1. simple solve
// 2. guess solve
// 3. exhaustive solve
// 4. exhaustive solve plus
// 5. steps
// 6. uncertainty level
// 7. writing tests
// 8. UX and UI?
// 9. all possible solutions?
// 10. generate the hardest sudoku?
