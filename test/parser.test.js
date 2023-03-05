import {
  parseStatement,
  parseTokens,
  initialState,
} from "../src/parser";

describe("parseStatement", () => {
  it("moves forward", () => {
    const result = parseStatement(
      "forward 10",
      initialState
    );
    expect(result.drawCommands).toEqual([
      {
        drawCommand: "drawLine",
        id: 0,
        x1: 0,
        y1: 0,
        x2: 10,
        y2: 0,
      },
    ]);
  });

  it("moves forward by a different amount", () => {
    const result = parseStatement(
      "forward 20",
      initialState
    );
    expect(result.drawCommands).toEqual([
      {
        drawCommand: "drawLine",
        id: 0,
        x1: 0,
        y1: 0,
        x2: 20,
        y2: 0,
      },
    ]);
  });

  it("starts at a different position", () => {
    const result = parseStatement("forward 20", {
      ...initialState,
      turtle: { x: 10, y: 10, angle: 0 },
    });
    expect(result.drawCommands).toEqual([
      {
        drawCommand: "drawLine",
        id: 0,
        x1: 10,
        y1: 10,
        x2: 30,
        y2: 10,
      },
    ]);
  });

  it("returns the new turtle position", () => {
    const result = parseStatement("forward 20", {
      ...initialState,
      turtle: { x: 10, y: 10, angle: 0 },
    });
    expect(result.turtle.x).toEqual(30);
    expect(result.turtle.y).toEqual(10);
  });

  it("maintains the same angle when moving forward", () => {
    const result = parseStatement("forward 20", {
      ...initialState,
      turtle: { x: 10, y: 10, angle: 30 },
    });
    expect(result.turtle.angle).toEqual(30);
  });

  it("issues a draw command if the command is a rotation", () => {
    const result = parseStatement("right 90", {
      ...initialState,
      turtle: { x: 0, y: 0, angle: 0 },
    });
    expect(result.drawCommands).toHaveLength(1);
  });

  it("rotates right", () => {
    const result = parseStatement("right 90", {
      ...initialState,
      turtle: { x: 0, y: 0, angle: 0 },
    });
    expect(result.turtle).toEqual({
      x: 0,
      y: 0,
      angle: 90,
    });
  });

  it("rotates right by a different amount", () => {
    const result = parseStatement("right 30", {
      ...initialState,
      turtle: { x: 0, y: 0, angle: 0 },
    });
    expect(result.turtle).toEqual({
      x: 0,
      y: 0,
      angle: 30,
    });
  });

  it("rotates right by adding on to existing rotation", () => {
    const result = parseStatement("right 30", {
      ...initialState,
      turtle: { x: 0, y: 0, angle: 90 },
    });
    expect(result.turtle).toEqual({
      x: 0,
      y: 0,
      angle: 120,
    });
  });

  it("moves backward", () => {
    const result = parseStatement(
      "backward 10",
      initialState
    );
    expect(result.drawCommands).toEqual([
      {
        drawCommand: "drawLine",
        id: 0,
        x1: 0,
        y1: 0,
        x2: -10,
        y2: 0,
      },
    ]);
  });

  it("rotates left", () => {
    const result = parseStatement("left 90", {
      ...initialState,
      turtle: { x: 0, y: 0, angle: 0 },
    });
    expect(result.turtle).toEqual({
      x: 0,
      y: 0,
      angle: -90,
    });
  });

  describe("errors", () => {
    it("includes the last entered line in the command", () => {
      const result = parseStatement(
        "unknown 90",
        initialState
      );
      expect(result.error.line).toEqual("unknown 90");
    });

    it("returns a basic error for an unknown command", () => {
      const result = parseStatement(
        "unknown 90",
        initialState
      );
      expect(result.error.description).toEqual(
        "Unknown function: unknown"
      );
      expect(result.error.position).toEqual({
        end: 6,
        start: 0,
      });
    });

    it("returns a basic error for a different unknown command", () => {
      const result = parseStatement(
        "still-unknown 90",
        initialState
      );
      expect(result.error.description).toEqual(
        "Unknown function: still-unknown"
      );
      expect(result.error.position).toEqual({
        end: 12,
        start: 0,
      });
    });

    it("records multiple events", () => {
      let state = parseStatement(
        "forward 10",
        initialState
      );
      state = parseStatement("forward 10", state);
      expect(state.drawCommands).toHaveLength(2);
    });

    it("returns error if value is not an integer", () => {
      const result = parseStatement(
        "forward notnumber",
        initialState
      );
      expect(result.error.description).toEqual(
        "Argument is not an integer"
      );
    });
  });

  it("appends draw command when rotating", () => {
    let state = parseStatement(
      "forward 10",
      initialState
    );
    state = parseStatement("right 10", state);
    expect(state.drawCommands).toHaveLength(2);
  });

  it("maintains draw commands on error", () => {
    let state = parseStatement(
      "forward 10",
      initialState
    );
    state = parseStatement("unknown-command", state);
    expect(state.drawCommands).toHaveLength(1);
  });

  describe("parsing", () => {
    it("accepts commands over multiple lines", () => {
      const state = parseStatement(
        "forward\n10",
        initialState
      );
      expect(state.drawCommands).toHaveLength(1);
    });

    it("accepts multiple commands on the same line", () => {
      let state = parseStatement(
        "forward 10 backward 10",
        initialState
      );
      expect(state.drawCommands).toHaveLength(2);
    });

    it("does not perform any commands if the statement was incomplete", () => {
      const state = parseStatement(
        "forward",
        initialState
      );
      expect(state.drawCommands).toEqual([]);
    });

    it("returns the existing state if the statement was incomplete", () => {
      const state = parseStatement(
        "forward 10 backward",
        initialState
      );
      expect(state).toEqual(initialState);
    });
  });

  describe("no-argument functions", () => {
    it("accepts the penup command", () => {
      const state = parseStatement(
        "penup",
        initialState
      );
      expect(state.pen.down).toEqual(false);
    });

    it("accepts the pendown command", () => {
      const state = parseStatement("pendown", {
        ...initialState,
        pen: { down: false },
      });
      expect(state.pen.down).toEqual(true);
    });
  });

  
  
  describe("case-insensitivity", () => {
    it("matches uppercase forward command", () => {
      let result = parseStatement(
        "FORWARD 10",
        initialState
      );
      expect(result.drawCommands).toHaveLength(1);
    });

  });

  describe("aliases", () => {
    it("matches fd alias", () => {
      let result = parseStatement(
        "fd 10",
        initialState
      );
      expect(result.drawCommands).toHaveLength(1);
    });
  });

  describe("tokenizing", () => {
    let tokenSpy;

    beforeEach(() => {
      tokenSpy = jest.fn();
    });

    it("passes whitespace through to current instruction if there is one", () => {
      parseStatement("; ", {
        allFunctions: [
          {
            names: [";"],
            parseToken: tokenSpy,
            perform: () => {},
          },
        ],
        parsedTokens: [],
      });

      expect(tokenSpy).toBeCalledWith(
        expect.anything(),
        {
          type: "whitespace",
          text: " ",
          lineNumber: 1,
        }
      );
    });

    it("includes line numbers when parsing multiple lines", () => {
      parseStatement("; \n ", {
        allFunctions: [
          {
            names: [";"],
            parseToken: tokenSpy,
            perform: () => {},
          },
        ],
        parsedTokens: [],
      });

      expect(tokenSpy).toBeCalledWith(
        expect.anything(),
        {
          type: "whitespace",
          text: " ",
          lineNumber: 1,
        }
      );
      expect(tokenSpy).toBeCalledWith(
        expect.anything(),
        {
          type: "whitespace",
          text: "\n",
          lineNumber: 1,
        }
      );
      expect(tokenSpy).toBeCalledWith(
        expect.anything(),
        {
          type: "whitespace",
          text: " ",
          lineNumber: 2,
        }
      );
    });

    it("batches up non-newline whitespace", () => {
      parseStatement("; \t", {
        allFunctions: [
          {
            names: [";"],
            parseToken: tokenSpy,
            perform: () => {},
          },
        ],
        parsedTokens: [],
      });

      expect(tokenSpy).toBeCalledWith(
        expect.anything(),
        {
          type: "whitespace",
          text: " \t",
          lineNumber: 1,
        }
      );
    });

    it("starts line numbers at existing script line number", () => {
      tokenSpy.mockReturnValue({ isComplete: true });
      let result = parseStatement("; ", {
        allFunctions: [
          {
            names: [";"],
            parseToken: tokenSpy,
            perform: () => {},
          },
        ],
        parsedStatements: [],
        parsedTokens: [{ lineNumber: 123 }],
      });

      expect(result.parsedTokens).toContainEqual({
        type: "token",
        text: ";",
        lineNumber: 124,
      });
    });
  });
});

describe("parseTokens", () => {
  it("parses all tokens", () => {
    const result = parseTokens(
      [
        {
          type: "token",
          text: "forward",
          lineNumber: 1,
          instructionId: 0,
        },
        {
          type: "whitespace",
          text: " ",
          lineNumber: 1,
          instructionId: 0,
        },
        {
          type: "token",
          text: "100",
          lineNumber: 1,
          instructionId: 0,
        },
        {
          type: "whitespace",
          text: "↵",
          lineNumber: 1,
        },
        {
          type: "token",
          text: "right",
          lineNumber: 2,
          instructionId: 1,
        },
        {
          type: "whitespace",
          text: " ",
          lineNumber: 2,
          instructionId: 1,
        },
        {
          type: "token",
          text: "90",
          lineNumber: 2,
          instructionId: 1,
        },
        {
          type: "whitespace",
          text: "↵",
          lineNumber: 2,
        },
      ],
      initialState
    );
    expect(result.drawCommands).toEqual([
      {
        drawCommand: "drawLine",
        id: 0,
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 0,
      },
      {
        drawCommand: "rotate",
        id: 1,
        previousAngle: 0,
        newAngle: 90,
      },
    ]);
  });
});
