import { useEffect, useRef, useState } from "react";
import { IconButton } from "@mui/material";
import {
  Undo as UndoIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import { EMPTY_BOARD } from "./constants";
import { solve, conditionalBorder, validatedValue, to1D } from "./utils";
import "./index.css";

export default function App() {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [unsolvedBoard, setUnsolvedBoard] = useState();
  const [error, setError] = useState(false);
  const [nextStep, setNextStep] = useState();
  const refs = useRef([]);

  useEffect(() => {
    if (nextStep) {
      const { x, y, val, needGuess } = nextStep;
      const ref = refs.current[to1D(x, y)];

      ref.style.backgroundColor = "#ddd";
      ref.style.color = needGuess ? "dodgerblue" : "yellowgreen";
      ref.value = val;

      const timeout = setTimeout(() => {
        ref.style.backgroundColor = "transparent";
        ref.style.color = "black";
        ref.value = "";
        setNextStep();
      }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [nextStep]);

  const handleChange = (e, { x, y }) => {
    setBoard((prev) =>
      prev.map((row, i) =>
        i !== x
          ? row
          : row.map((val, j) =>
              j !== y ? val : validatedValue(e.target.value)
            )
      )
    );
  };

  const solveBoard = () => {
    const result = solve(board);
    if (result.board) {
      board.forEach((row, x) => {
        row.forEach((val, y) => {
          const ref = refs.current[to1D(x, y)];
          if (!val) {
            ref.style.color = "yellowgreen";
          }
        });
      });
      setBoard(result.board);
      setUnsolvedBoard(board);
    } else {
      erroring();
    }
  };

  const unsolveBoard = () => {
    setBoard(unsolvedBoard);
    setUnsolvedBoard();

    board.forEach((row, x) => {
      row.forEach((_, y) => {
        const ref = refs.current[to1D(x, y)];
        ref.style.color = "black";
      });
    });
  };

  const clearBoard = () => {
    setBoard(EMPTY_BOARD);
    setUnsolvedBoard();
  };

  const showNextStep = () => {
    const result = solve(board).steps?.at(0);
    if (result) {
      setNextStep(result);
    } else {
      erroring();
    }
  };

  const erroring = () => {
    setError(true);
    setTimeout(() => {
      setError(false);
    }, 1000);
  };

  return (
    <div className="main">
      {board.map((row, x) => (
        <div key={-x} className="row">
          {row.map((value, y) => (
            <input
              key={to1D(x, y)}
              ref={(ref) => {
                refs.current[to1D(x, y)] = ref;
              }}
              style={{
                borderRadius: 0,
                borderWidth: 0.5,
                color: error ? "red" : "black",
                borderTop: conditionalBorder(Number.isInteger(x / 3)),
                borderLeft: conditionalBorder(Number.isInteger(y / 3)),
                borderBottom: conditionalBorder(x === 8),
                borderRight: conditionalBorder(y === 8),
              }}
              type="tel"
              pattern="[0–9]*"
              disabled={error || !!unsolvedBoard}
              value={value}
              onChange={(e) => handleChange(e, { x, y })}
            />
          ))}
        </div>
      ))}
      {!error && !nextStep && (
        <div className="buttons">
          {!unsolvedBoard && (
            <IconButton onClick={showNextStep}>
              <QuizIcon color="info" sx={{ fontSize: 32, padding: 1 }} />
            </IconButton>
          )}
          {unsolvedBoard ? (
            <IconButton onClick={unsolveBoard}>
              <UndoIcon
                sx={{
                  stroke: "gray",
                  strokeWidth: 2,
                  fontSize: 32,
                  padding: 1,
                }}
              />
            </IconButton>
          ) : (
            <IconButton onClick={solveBoard}>
              <CheckIcon
                sx={{
                  stroke: "yellowgreen",
                  strokeWidth: 2,
                  fontSize: 32,
                  padding: 1,
                }}
              />
            </IconButton>
          )}
          {!unsolvedBoard && (
            <IconButton onClick={clearBoard}>
              <ClearIcon
                sx={{
                  stroke: "tomato",
                  strokeWidth: 2,
                  fontSize: 32,
                  padding: 1,
                }}
              />
            </IconButton>
          )}
        </div>
      )}
    </div>
  );
}
