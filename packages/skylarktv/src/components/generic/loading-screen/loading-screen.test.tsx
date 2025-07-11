import React from "react";
import { render, screen } from "../../../../test-utils";
import { LoadingScreen } from "./loading-screen.component";
import englishTranslations from "../../../../locales/en-gb/common.json";

const title = "SkylarkTV";

describe("LoadingScreen component", () => {
  it("the component renders correctly", () => {
    render(<LoadingScreen show title={title} />);
    // eslint-disable-next-line no-restricted-syntax
    for (const char of title) {
      expect(screen.getAllByText(char)).toHaveLength(
        (title.match(new RegExp(char, "g")) || []).length,
      );
    }
    expect(screen.getByText(englishTranslations["by-skylark"])).toBeTruthy();
  });
});
