import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, test } from "vite-plus/test";
import { Bones, BonesForce } from "../src/react/bones.ts";
import { createBones } from "../src/react/create-bones.ts";

// ---------------------------------------------------------------------------
// The loading flag that BonesStart/BonesEnd bracket around a skeleton tree
// (BON-11, BON-14). These tests run outside React Server Components, where
// React.cache() is a passthrough, so they cover the module-context fallback;
// the bracket semantics they pin are renderer-independent.
// ---------------------------------------------------------------------------

const user = { name: "Pikachu" };

function Card({ id, data }: { id: string; data?: typeof user | Promise<typeof user> }) {
  const { bone } = createBones(data);
  return <span data-testid={id} {...bone("text")} />;
}

afterEach(cleanup);

test("BonesForce forces skeletons in a plain client render", () => {
  render(
    <BonesForce>
      <Card id="a" data={user} />
    </BonesForce>,
  );
  expect(screen.getByTestId("a").getAttribute("data-bone")).toBe("text");
});

test("BonesForce forces skeletons in non-RSC server rendering", () => {
  const html = renderToString(
    <BonesForce>
      <Card id="a" data={user} />
    </BonesForce>,
  );
  expect(html).toContain('data-bone="text"');
});

test("a later sibling of a nested BonesForce keeps its skeleton", () => {
  render(
    <BonesForce>
      <Card id="a" data={user} />
      <BonesForce>
        <Card id="b" data={user} />
      </BonesForce>
      <Card id="c" data={user} />
    </BonesForce>,
  );
  for (const id of ["a", "b", "c"]) {
    expect(screen.getByTestId(id).getAttribute("data-bone")).toBe("text");
  }
});

test("the flag clears after the boundary", () => {
  render(
    <>
      <BonesForce>
        <Card id="inside" data={user} />
      </BonesForce>
      <Card id="outside" data={user} />
    </>,
  );
  expect(screen.getByTestId("inside").getAttribute("data-bone")).toBe("text");
  expect(screen.getByTestId("outside").getAttribute("data-bone")).toBeNull();
});

test("a later sibling of a nested Bones keeps its skeleton in the outer fallback", () => {
  // DeepReal takes no promise prop, so swapPromises leaves it alone and its
  // bones depend entirely on the bracketed flag — the path BON-11 breaks.
  function DeepReal({ id }: { id: string }) {
    return <Card id={id} data={user} />;
  }
  const pending = new Promise<typeof user>(() => {});
  render(
    <Bones>
      <Card id="a" data={pending} />
      <Bones>
        <Card id="b" data={pending} />
      </Bones>
      <DeepReal id="c" />
    </Bones>,
  );
  for (const id of ["a", "b", "c"]) {
    expect(screen.getByTestId(id).getAttribute("data-bone")).toBe("text");
  }
});
