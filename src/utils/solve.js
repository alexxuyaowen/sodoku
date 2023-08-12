const GUESS_LIMIT = 2023;

export const solve = (board_UI) => {
  const board = board_UI.map((row) => row.map((val) => +val));

  if (!isBoardValid(board)) {
    return "invalid board";
  }

  const steps = [];

  const { toGuess, logicSolvedBoard } = logicSolve(board, steps);

  if (!logicSolvedBoard) {
    return "unsolvable board";
  }

  if (toGuess) {
    return guessSolve(
      logicSolvedBoard,
      toGuess,
      [{ prevBoard: logicSolvedBoard, toGuess }],
      steps
    );
  }

  return { board: logicSolvedBoard, steps };
};

const logicSolve = (board, steps) => {
  const notes = constructNotes(board);
  if (!notes) {
    return false;
  }

  const [logicSolvedBoard, logicSolvedSteps] = [
    deepCopy(board),
    deepCopy(steps),
  ];
  while (true) {
    let needGuess = true;
    for (let i = 0; i < 9; i++) {
      const currBox = notes.filter(({ box }) => box === i);
      const isModified = boxCheck(currBox, notes, i);

      if (isModified) {
        if (isModified === -1) {
          return false;
        }
        needGuess = false;
      }

      const results = [
        check(notes.filter(({ row }) => row === i)),
        check(notes.filter(({ col }) => col === i)),
        check(currBox),
      ];

      for (const result of results) {
        for (const found of result) {
          const { x, y, val } = found;
          if (logicSolvedBoard[x][y] === 0) {
            if (!isValid(logicSolvedBoard, { x, y, val })) {
              return false;
            }

            notes.splice(
              notes.findIndex(({ row, col }) => row === x && col === y),
              1
            );

            notes.forEach(({ row, col, box, vals }) => {
              if (vals && (row === x || col === y || box === getBox(x, y))) {
                vals.delete(val);
                if (vals.size === 0) {
                  return false;
                }
              }
            });

            needGuess = false;
            logicSolvedBoard[x][y] = val;
            logicSolvedSteps.push({
              step: logicSolvedSteps.length + 1,
              ...found,
            });
          }
        }
      }
    }

    if (needGuess) {
      steps.push(...logicSolvedSteps);
      if (!isSolved(logicSolvedBoard)) {
        for (let i = 2; i <= 9; i++) {
          const toGuess = notes.find((note) => note.vals?.size === i);
          if (toGuess) {
            return {
              toGuess: {
                x: toGuess.row,
                y: toGuess.col,
                vals: [...toGuess.vals],
              },
              logicSolvedBoard,
            };
          }
        }

        return false;
      }

      return { logicSolvedBoard };
    }
  }
};

const constructNotes = (board) => {
  const notes = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const box = getBox(i, j);
      if (!board[i][j]) {
        const possibleValues = new Set();
        for (let val = 1; val <= 9; val++) {
          if (isValid(board, { x: i, y: j, val })) {
            possibleValues.add(val);
          }
        }

        if (!possibleValues.size) {
          return false;
        }

        notes.push({
          vals: possibleValues,
          row: i,
          col: j,
          box,
        });
      }
    }
  }
  return notes;
};

const check = (arr) => {
  const valuesCount = new Array(10).fill(0);
  const result = [];

  for (const { row: x, col: y, vals } of arr) {
    if (vals.size === 1) {
      const val = getVal(vals);
      result.push({ x, y, val });
      valuesCount[val] = -9;
    }
    vals?.forEach((val) => valuesCount[val]++);
  }

  for (let val = 1; val <= 9; val++) {
    if (valuesCount[val] === 1) {
      const { row: x, col: y } = arr.find(({ vals }) => vals.has(val));
      result.push({ x, y, val });
    }
  }

  return result;
};

const boxCheck = (arr, notes, i) => {
  let isModified = false;

  const [rowMap, colMap] = [new Map(), new Map()];
  for (const { row, col, vals } of arr) {
    if (!rowMap.has(row)) {
      rowMap.set(row, vals);
    } else {
      rowMap.set(row, new Set([...vals, ...rowMap.get(row)]));
    }
    if (!colMap.has(col)) {
      colMap.set(col, vals);
    } else {
      colMap.set(col, new Set([...vals, ...colMap.get(col)]));
    }
  }

  const [rowCount, colCount] = [new Array(10).fill(0), new Array(10).fill(0)];
  for (const vals of rowMap.values()) {
    vals?.forEach((val) => rowCount[val]++);
  }
  for (const vals of colMap.values()) {
    vals?.forEach((val) => colCount[val]++);
  }
  for (let val = 1; val <= 9; val++) {
    if (rowCount[val] === 1) {
      for (const key of rowMap.keys()) {
        if (rowMap.get(key).has(val)) {
          for (const { row, box, vals } of notes) {
            if (vals?.has(val) && box !== i && row === key) {
              vals.delete(val);
              if (vals.size === 0) {
                return -1;
              }
              isModified = true;
            }
          }
        }
      }
    }
    if (colCount[val] === 1) {
      for (const key of colMap.keys()) {
        if (colMap.get(key).has(val)) {
          for (const { col, box, vals } of notes) {
            if (vals?.has(val) && box !== i && col === key) {
              vals.delete(val);
              if (vals.size === 0) {
                return -1;
              }
              isModified = true;
            }
          }
        }
      }
    }
  }

  return isModified;
};

const guessSolve = (board, toGuess, history = [], steps) => {
  for (let numGuesses = 0; numGuesses < GUESS_LIMIT; numGuesses++) {
    const { x, y, vals } = toGuess;
    if (vals.length) {
      const guessedBoard = deepCopy(board);
      guessedBoard[x][y] = vals[0];

      const logicSolvedSteps = [];
      const { toGuess: nextGuess, logicSolvedBoard } = logicSolve(
        guessedBoard,
        logicSolvedSteps
      );

      if (isSolved(logicSolvedBoard)) {
        for (const h of history) {
          steps.push({
            step: steps.length + 1,
            x: h.toGuess.x,
            y: h.toGuess.y,
            val: h.toGuess.vals[0],
            isGuessed: true,
          });
          const simpleSteps = h.logicSolvedSteps?.map((step) => ({
            ...step,
            step: step.step + steps.length,
          }));
          if (simpleSteps) {
            steps.push(...simpleSteps);
          }
        }

        const simpleSteps = logicSolvedSteps?.map((step) => ({
          ...step,
          step: step.step + steps.length,
        }));
        if (simpleSteps) {
          steps.push(...simpleSteps);
        }

        return {
          board: logicSolvedBoard,
          steps,
        };
      } else if (nextGuess) {
        board = logicSolvedBoard;
        toGuess = nextGuess;
        history.push({
          prevBoard: logicSolvedBoard,
          toGuess: nextGuess,
          logicSolvedSteps,
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

      if (!latestHistory) return "unsolvable board";
      latestHistory.toGuess.vals.shift();
      board = latestHistory.prevBoard;
      toGuess = latestHistory.toGuess;
    }
  }

  return "unsolvable board (maximum number of guesses reached)";
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

const isSolved = (board) =>
  Array.isArray(board) && !board.flat().includes(0) && isBoardValid(board);

const getVal = (vals) => {
  const [val] = vals;
  return val;
};

const getBox = (row, col) => ((row / 3) | 0) * 3 + ((col / 3) | 0);
