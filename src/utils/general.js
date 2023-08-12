import { VALID_VALUES } from "../constants";

export const validatedValue = (value) => {
  const val = +value.at(-1);
  return VALID_VALUES.has(+val)
    ? val
    : VALID_VALUES.has(+value[0])
    ? value[0]
    : 0;
};

export const conditionalBorder = (condition) =>
  `${condition ? 3 : 0.5}px solid black`;

export const to1D = (x, y) => x * 9 + y;

export const isEmpty = (board) =>
  board.flat().reduce((count, val) => count + !val, 0) === 81;
