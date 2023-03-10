import { functionWithName } from "./functionTable";
import { perform } from "./perform";

const areAllParametersFilled = (
  parameters,
  functionDefinition
) =>
  Object.keys(parameters).length ===
  functionDefinition.parameters.length;

const addNextParameter = (
  existingParameters,
  functionDefinition,
  value
) => {
  const nextArgName =
    functionDefinition.parameters[
      Object.keys(existingParameters).length
    ];
  const newParameters = {
    ...existingParameters,
    [nextArgName]: value,
  };
  return {
    collectedParameters: newParameters,
    isComplete: areAllParametersFilled(
      newParameters,
      functionDefinition
    ),
  };
};

const findFunction = (
  { allFunctions, nextInstructionId, parsedTokens },
  token
) => {
  const { type, text } = token;
  if (type === "whitespace") {
    return {};
  }
  const functionName = text;
  const foundFunction = functionWithName(
    functionName,
    allFunctions
  );
  if (foundFunction) {
    return {
      currentInstruction: {
        id: nextInstructionId,
        ...foundFunction.initial,
        functionDefinition: foundFunction,
        collectedParameters: {},
      },
      nextInstructionId: nextInstructionId + 1,
      parsedTokens: [
        ...parsedTokens,
        {
          ...token,
          instructionId: nextInstructionId,
        },
      ],
    };
  }
  throw {
    description: `Unknown function: ${functionName.toLowerCase()}`,
    position: {
      start: 0,
      end: functionName.length - 1,
    },
  };
};

export const parseNextToken = (state, nextToken) => {
  const { currentInstruction } = state;
  if (currentInstruction) {
    const updatedInstruction = {
      ...currentInstruction,
      ...currentInstruction.functionDefinition.parseToken(
        state,
        nextToken
      ),
    };
    return {
      ...state,
      currentInstruction: updatedInstruction,
      parsedTokens: [
        ...state.parsedTokens,
        {
          ...nextToken,
          instructionId: updatedInstruction.id,
        },
      ],
    };
  }
  if (nextToken.type === "whitespace") {
    return {
      ...state,
      parsedTokens: [
        ...state.parsedTokens,
        nextToken,
      ],
    };
  }
  return {
    ...state,
    ...findFunction(state, nextToken),
  };
};

export const parseAndSaveStatement = (
  state,
  token
) => {
  const updatedState = parseNextToken(state, token);
  if (
    updatedState.currentInstruction &&
    updatedState.currentInstruction.isComplete
  ) {
    return {
      ...perform(
        updatedState,
        updatedState.currentInstruction
      ),
      parsedStatements: [
        ...updatedState.parsedStatements,
        updatedState.currentInstruction,
      ],
      currentInstruction: undefined,
    };
  }
  return updatedState;
};


export const parseCall = (state, token) => {
  const {
    collectedParameters,
    functionDefinition,
    // parsingListValue,
  } = state.currentInstruction;
  if (token.type === "whitespace") return state.currentInstruction;

    return addNextParameter(
      collectedParameters,
      functionDefinition,
      token.text
    );
};
