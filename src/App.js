import { useEffect, useRef, useState } from "react";
import { SkipPrevious, PlayArrow, Pause, SkipNext } from "@mui/icons-material";
import { EMPTY_BOARD, EXPERIMENTAL_BOARD } from "./constants";
import {
  solve,
  conditionalBorder,
  validatedValue,
  to1D,
  isEmpty,
} from "./utils";
import { Button } from "./components/ui/Button";
import "./index.css";

export default function App() {
  const [board, setBoard] = useState(EXPERIMENTAL_BOARD);
  const [originalBoard, setOriginalBoard] = useState();
  const [boardToRecover, setBoardToRecover] = useState();
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const [canRecover, setCanRecover] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    if (isPlaying) {
      const { steps } = solve(board);

      if (steps) {
        let i = 0;
        const intervalID = setInterval(() => {
          if (i === steps.length) {
            setIsPlaying(false);
            return;
          }

          if (!played) {
            setOriginalBoard(board);
            setPlayed(true);
          }
          putOnBoard(steps[i]);
          const { x, y, isGuessed } = steps[i];
          const ref = refs.current[to1D(x, y)];
          ref.focus();
          ref.style.color = isGuessed ? "orange" : "green";
          i++;
        }, 1000);

        return () => {
          clearInterval(intervalID);
          setIsPlaying(false);
        };
      } else {
        erroring();
      }
    }
  }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (originalBoard && (played || isSolved)) {
      originalBoard.forEach((row, x) => {
        row.forEach((val, y) => {
          if (val) {
            const ref = refs.current[to1D(x, y)];
            ref.style.backgroundColor = "#ddd";
          }
        });
      });
    }
  }, [originalBoard, played, isSolved]);

  const solveBoard = () => {
    setIsPlaying(false);
    const { board: solvedBoard, steps } = solve(originalBoard || board);
    if (solvedBoard && steps) {
      steps.forEach(({ x, y, val, isGuessed }) => {
        const ref = refs.current[to1D(x, y)];
        ref.value = val;
        ref.style.color = isGuessed ? "orange" : "green";
      });

      if (!originalBoard) {
        setOriginalBoard(board);
      }

      setBoard(solvedBoard);
      setIsSolved(true);
    } else {
      erroring();
    }
  };

  const goBack = () => {
    if (isEmpty(board)) {
      return;
    }

    setIsPlaying(false);
    setPlayed(false);
    if (originalBoard) {
      board.forEach((row, x) => {
        row.forEach((_, y) => {
          const ref = refs.current[to1D(x, y)];
          ref.style.backgroundColor = "transparent";
          ref.style.color = "black";
        });
      });
      setBoard(boardToRecover || originalBoard);
      setOriginalBoard();
      setIsSolved(false);
    } else {
      setBoardToRecover(board);
      setBoard(EMPTY_BOARD);
      setOriginalBoard(EMPTY_BOARD);
      setCanRecover(true);
    }
  };

  const recover = () => {
    setBoard(boardToRecover);
    setOriginalBoard(boardToRecover);
    setCanRecover(false);
  };

  const erroring = () => {
    setIsPlaying(false);
    setError(true);
    const timeoutId = setTimeout(() => {
      setError(false);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const putOnBoard = ({ x, y, val }) => {
    setBoard((prev) =>
      prev.map((row, i) =>
        i === x ? row.map((curr, j) => (j === y ? val : curr)) : row
      )
    );
  };

  const selectOnFocus = (x, y) => () => {
    refs.current[to1D(x, y)].select();
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
              disabled={error || isSolved || played}
              value={value || ""}
              onFocus={selectOnFocus(x, y)}
              onChange={(e) => {
                putOnBoard({ x, y, val: validatedValue(e.target.value) });
                if (canRecover) {
                  setCanRecover(false);
                  setOriginalBoard();
                  setBoardToRecover();
                }
              }}
            />
          ))}
        </div>
      ))}
      <div className="buttons">
        <Button
          onClick={goBack}
          Icon={SkipPrevious}
          disabled={canRecover || error}
        />
        <Button
          onClick={togglePlay}
          Icon={isPlaying ? Pause : PlayArrow}
          disabled={canRecover || isSolved || error}
        />
        <Button
          onClick={canRecover ? recover : solveBoard}
          Icon={SkipNext}
          disabled={isSolved || error}
        />
      </div>
    </div>
  );
}
