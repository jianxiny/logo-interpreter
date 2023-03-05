import {
  forward,
  backward,
  left,
  right,
} from "./movement";
import { penup, pendown } from "./pen";
import { clearScreen } from "./clearScreen";
import { comment } from "./comment";

export const functionWithName = (name, functions) => {
  const lowerCaseName = name.toLowerCase();
  return functions.find((f) =>
    f.names
      .map((name) => name.toLowerCase())
      .includes(lowerCaseName)
  );
};

export const builtInFunctions = [
  forward,
  backward,
  left,
  right,
  penup,
  pendown,
  clearScreen,
  comment,
];
