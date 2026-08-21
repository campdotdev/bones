import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { createBones, forceBones } from "../src/react/create-bones.ts";

const mockData = { text: "Hello World" };

function TextSkeleton({ data }: { data?: typeof mockData | Promise<typeof mockData> }) {
  const { bone, data: resolved } = createBones(data);
  return (
    <h3 data-testid="heading" {...bone("text")}>
      {resolved?.text}
    </h3>
  );
}

function BlockSkeleton({ data }: { data?: typeof mockData | Promise<typeof mockData> }) {
  const { bone } = createBones(data);
  return <div data-testid="block" {...bone("block")} style={{ width: 120, height: 120 }} />;
}

function ContainerSkeleton({ data }: { data?: typeof mockData | Promise<typeof mockData> }) {
  const { bone, data: resolved } = createBones(data);
  return (
    <div data-testid="container" {...bone("container")}>
      <span {...bone("text")}>{resolved?.text}</span>
    </div>
  );
}

afterEach(cleanup);

describe("CSS skeleton classes", () => {
  test("single-line text skeleton has data-bone=text", () => {
    const { getByTestId } = render(<TextSkeleton data={forceBones} />);
    expect(getByTestId("heading").getAttribute("data-bone")).toBe("text");
  });

  test("block skeleton has data-bone=block", () => {
    const { getByTestId } = render(<BlockSkeleton data={forceBones} />);
    expect(getByTestId("block").getAttribute("data-bone")).toBe("block");
  });

  test("container skeleton has data-bone=container", () => {
    const { getByTestId } = render(<ContainerSkeleton data={forceBones} />);
    expect(getByTestId("container").getAttribute("data-bone")).toBe("container");
  });

  test("loaded container has no data-bone attribute", () => {
    const { getByTestId } = render(<ContainerSkeleton data={mockData} />);
    expect(getByTestId("container").getAttribute("data-bone")).toBeNull();
  });

  test("loaded text has no data-bone attribute", () => {
    const { getByTestId } = render(<TextSkeleton data={mockData} />);
    expect(getByTestId("heading").getAttribute("data-bone")).toBeNull();
  });
});
