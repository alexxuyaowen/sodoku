import { useState } from "react";
import { EMPTY_BOARD, VALID_VALUES } from "./utils/constants";
import { solve } from "./utils/solve";
import "./index.css";

export default function App() {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [error, setError] = useState(false);
  const [unsolvedBoard, setUnsolvedBoard] = useState();

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
  };

  const clearBoard = () => {
    setBoard(EMPTY_BOARD);
    setUnsolvedBoard();
  };

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
                borderTop: Number.isInteger(x / 3)
                  ? "3px solid black"
                  : "0.5px solid black",
                borderLeft: Number.isInteger(y / 3)
                  ? "3px solid black"
                  : "0.5px solid black",
                borderBottom: x === 8 ? "3px solid black" : "0.5px solid black",
                borderRight: y === 8 ? "3px solid black" : "0.5px solid black",
              }}
              disabled={error}
              value={value}
              onChange={(e) => handleChange(e, { x, y })}
            />
          ))}
        </div>
      ))}
      <div className="buttons">
        <button onClick={unsolveBoard} disabled={!unsolvedBoard}>
          o
        </button>
        <button onClick={solveBoard}>O</button>
        <button onClick={clearBoard}>X</button>
      </div>
    </div>
  );
}
