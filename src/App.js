import { useState } from "react";
import { IconButton } from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { EMPTY_BOARD, VALID_VALUES } from "./utils/constants";
import { solve } from "./utils/solve";
import "./index.css";

export default function App() {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [unsolvedBoard, setUnsolvedBoard] = useState();
  const [error, setError] = useState(false);

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

  const validatedValue = (value) => {
    const val = +value.at(-1);
    return VALID_VALUES.has(+val) ? val : "";
  };

  const solveBoard = () => {
    const result = solve(board);
    if (result.board) {
      setBoard(result.board);
      setUnsolvedBoard(board);
    } else {
      setBoard(board);
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  const unsolveBoard = () => {
    setBoard(unsolvedBoard);
    setUnsolvedBoard();
  };

  const clearBoard = () => {
    setBoard(EMPTY_BOARD);
    setUnsolvedBoard();
  };

  const conditionalBorder = (condition) =>
    `${condition ? 3 : 0.5}px solid black`;

  return (
    <div className="main">
      {board.map((row, x) => (
        <div className="row">
          {row.map((value, y) => (
            <input
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
              disabled={error}
              value={value}
              onChange={(e) => handleChange(e, { x, y })}
            />
          ))}
        </div>
      ))}
      <div className="buttons">
        {unsolvedBoard ? (
          <IconButton onClick={unsolveBoard}>
            <UndoIcon
              sx={{ stroke: "gray", strokeWidth: 2, fontSize: 32, padding: 1 }}
            />
          </IconButton>
        ) : (
          <IconButton onClick={solveBoard}>
            <CheckIcon
              sx={{
                stroke: "green",
                strokeWidth: 2,
                fontSize: 32,
                padding: 1,
              }}
            />
          </IconButton>
        )}
        <IconButton onClick={clearBoard}>
          <ClearIcon
            sx={{ stroke: "red", strokeWidth: 2, fontSize: 32, padding: 1 }}
          />
        </IconButton>
      </div>
    </div>
  );
}
