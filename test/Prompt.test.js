import React from "react";
import { expectRedux } from "expect-redux";
import {
  initializeReactContainer,
  renderWithStore,
  dispatchToStore,
  store,
  element,
  elements,
  change,
  keyPress,
} from "./reactTestExtensions";
import { Prompt } from "../src/Prompt";

describe("Prompt", () => {
  beforeEach(() => {
    initializeReactContainer();
  });

  const renderInTableWithStore = (component) =>
    renderWithStore(<table>{component}</table>);

  it("renders a tbody", () => {
    renderInTableWithStore(<Prompt />);
    expect(element("tbody")).not.toBeNull();
  });

  const tableCell = (n) => elements("td")[n];

  it("renders a table cell with a prompt indicator as the first cell", () => {
    renderInTableWithStore(<Prompt />);
    expect(tableCell(0)).toContainText(">");
  });

  it("sets a class of promptIndicator on the first cell", () => {
    renderInTableWithStore(<Prompt />);
    expect(tableCell(0)).toHaveClass(
      "promptIndicator"
    );
  });

  it("renders a table cell with an empty textarea as the second cell", () => {
    renderInTableWithStore(<Prompt />);
    expect(
      tableCell(1).firstChild
    ).toBeElementWithTag("textarea");
  });

  const textArea = () => tableCell(1).firstChild;

  it("sets the textarea to have an empty value", () => {
    renderInTableWithStore(<Prompt />);
    expect(textArea().value).toEqual("");
  });

  it("sets the textarea to initially have a height of 20", () => {
    renderInTableWithStore(<Prompt />);
    expect(textArea().getAttribute("style")).toEqual(
      "height: 20px;"
    );
  });

  const submitAnInstruction = (
    line = "forward 10\n"
  ) => {
    keyPress(textArea(), { charCode: 13 });
    change(textArea(), line);
  };

  describe("user enters an instruction", () => {
    it("dispatches an action with the updated edit line when the user hits enter on the text field", () => {
      const line =
        "repeat 4\n[ forward 10 right 90 ]\n";
      renderInTableWithStore(<Prompt />);
      submitAnInstruction(line);
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({
          type: "SUBMIT_EDIT_LINE",
          text: line,
        });
    });

    it("blanks the edit field", () => {
      renderInTableWithStore(<Prompt />);
      submitAnInstruction("forward 10\n");
      expect(textArea().value).toEqual("");
    });

    it("dispatches a START_ANIMATING event", () => {
      renderInTableWithStore(<Prompt />);
      submitAnInstruction("forward 10\n");
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: "START_ANIMATING" });
    });
  });

  describe("prompt focus", () => {
    it("sets focus when component first renders", () => {
      renderInTableWithStore(<Prompt />);
      expect(document.activeElement).toEqual(
        textArea()
      );
    });

    const jsdomClearFocus = () => {
      const node = document.createElement("input");
      document.body.appendChild(node);
      node.focus();
      node.remove();
    };

    it("calls focus on the underlying DOM element if promptFocusRequest is true", async () => {
      renderInTableWithStore(<Prompt />);
      jsdomClearFocus();
      dispatchToStore({
        type: "PROMPT_FOCUS_REQUEST",
      });
      expect(document.activeElement).toEqual(
        textArea()
      );
    });

    it("dispatches an action notifying that the prompt has focused", () => {
      renderInTableWithStore(<Prompt />);
      dispatchToStore({
        type: "PROMPT_FOCUS_REQUEST",
      });
      return expectRedux(store)
        .toDispatchAnAction()
        .matching({ type: "PROMPT_HAS_FOCUSED" });
    });
  });
});
