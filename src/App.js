import { Fragment, useState } from "react";
import { EMPTY_BOARD, VALID_VALUES } from "./utils/constants";
import { solve } from "./utils/solve";
import "./index.css";

export default function App() {
  const [board, setBoard] = useState(EMPTY_BOARD);
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
    const val = +value[0];
    return VALID_VALUES.has(+val) ? val : "";
  };

  const solveBoard = () => {
    setUnsolvedBoard(board);
    setBoard(solve(board).board || board);
  };

  const unsolveBoard = () => {
    setBoard(unsolvedBoard);
  };

  const clearBoard = () => {
    setBoard(EMPTY_BOARD);
    setUnsolvedBoard(EMPTY_BOARD);
  };

  return (
    <Fragment>
      {board.map((row, x) => (
        <div className='row'>
          {row.map((value, y) => (
            <input
              style={{ borderRadius: 0, borderWidth: 0.5 }}
              value={value}
              onChange={(e) => handleChange(e, { x, y })}
              size={1}
            />
          ))}
        </div>
      ))}
      <button onClick={solveBoard}>O</button>
      <button onClick={unsolveBoard}>o</button>
      <button onClick={clearBoard}>X</button>
    </Fragment>
  );
}
