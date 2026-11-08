import { render, screen } from "@testing-library/react";

import { CardEffects } from "@/features/cards/viewer/components/CardEffects";

function isBefore(first: HTMLElement, second: HTMLElement) {
  return Boolean(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING
  );
}

describe("CardEffects", () => {
  it("shows each clarification right after its card text", () => {
    render(
      <CardEffects
        trait="React"
        effect1="Draw 1"
        effect2="Always: 1 DMG"
        clarify1="You may play this in Response to any Play."
        clarify2="Draw 1 card from a draw pile."
        clarify3="This effect always triggers. Deal 1 damage."
      />
    );

    const trait = screen.getByText("React");
    const traitClarify = screen.getByText(/in Response to any Play/);
    const effect1 = screen.getByText("Draw 1");
    const effect1Clarify = screen.getByText(/from a draw pile/);
    const effect2 = screen.getByText("Always: 1 DMG");
    const effect2Clarify = screen.getByText(/Deal 1 damage/);

    expect(isBefore(trait, traitClarify)).toBe(true);
    expect(isBefore(traitClarify, effect1)).toBe(true);
    expect(isBefore(effect1, effect1Clarify)).toBe(true);
    expect(isBefore(effect1Clarify, effect2)).toBe(true);
    expect(isBefore(effect2, effect2Clarify)).toBe(true);
  });

  it("works for cards with no clarification text", () => {
    render(<CardEffects trait={null} effect1="Draw 1" effect2={null} />);

    expect(screen.getByText("Draw 1")).toBeInTheDocument();
    expect(screen.queryByText("Trait")).not.toBeInTheDocument();
  });

  it("does not show a clarification for text that isn't on the card", () => {
    render(
      <CardEffects
        trait={null}
        effect1="Draw 1"
        effect2={null}
        clarify1="Orphan trait clarification"
      />
    );

    expect(
      screen.queryByText("Orphan trait clarification")
    ).not.toBeInTheDocument();
  });
});
