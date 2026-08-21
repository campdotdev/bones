import { cleanup, render, screen, act } from "@testing-library/react";
import { Suspense } from "react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { createBones, forceBones } from "../src/react/create-bones.ts";

const mockData = { name: "Pikachu" };

function TestText({ data }: { data?: typeof mockData | Promise<typeof mockData> }) {
  const { bone } = createBones(data);
  return <span data-testid="target" {...bone("text")} />;
}

function TestBlock({ data }: { data?: typeof mockData | Promise<typeof mockData> }) {
  const { bone } = createBones(data);
  return <div data-testid="target" {...bone("block")} />;
}

function TestContainer({ data }: { data?: typeof mockData | Promise<typeof mockData> }) {
  const { bone } = createBones(data);
  return (
    <div data-testid="target" {...bone("container")}>
      <span {...bone("text")}>child</span>
    </div>
  );
}

function TestLength({ data }: { data?: typeof mockData | Promise<typeof mockData> }) {
  const { bone } = createBones(data);
  return <span data-testid="target" {...bone("text", { length: 12 })} />;
}

function TestContained({ data }: { data?: typeof mockData | Promise<typeof mockData> }) {
  const { bone } = createBones(data);
  return <span data-testid="target" {...bone("text", { contained: true, length: 7 })} />;
}

function TestData({ data }: { data?: typeof mockData | Promise<typeof mockData> }) {
  const { bone, data: resolved } = createBones(data);
  return (
    <span data-testid="target" {...bone("text")}>
      {resolved?.name}
    </span>
  );
}

const mockListData = { name: "Pikachu", types: ["electric"] };

function TestRepeat({ data }: { data?: typeof mockListData | Promise<typeof mockListData> }) {
  const { bone, data: resolved, repeat } = createBones(data);
  return (
    <div data-testid="target">
      {repeat(resolved?.types, 2, (item, i) => (
        <span key={item ?? i} {...bone("text")}>
          {item}
        </span>
      ))}
    </div>
  );
}

afterEach(cleanup);

describe("createBones", () => {
  test("returns data-bone=text and aria-busy with forceBones", () => {
    const { getByTestId } = render(<TestText data={forceBones} />);
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBe("text");
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  test("returns data-bone=block and aria-busy with forceBones", () => {
    const { getByTestId } = render(<TestBlock data={forceBones} />);
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBe("block");
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  test("returns data-bone=container and aria-busy with forceBones", () => {
    const { getByTestId } = render(<TestContainer data={forceBones} />);
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBe("container");
    expect(el.getAttribute("aria-busy")).toBe("true");
  });

  test("container does not set src", () => {
    const { getByTestId } = render(<TestContainer data={forceBones} />);
    const el = getByTestId("target");
    expect(el.getAttribute("src")).toBeNull();
  });

  test("returns empty props when data is available", () => {
    const { getByTestId } = render(<TestText data={mockData} />);
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBeNull();
    expect(el.getAttribute("aria-busy")).toBeNull();
  });

  test("returns empty props when data is undefined", () => {
    const { getByTestId } = render(<TestText />);
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBeNull();
    expect(el.getAttribute("aria-busy")).toBeNull();
  });

  test("sets --bone-length CSS variable for text with length", () => {
    const { getByTestId } = render(<TestLength data={forceBones} />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.getAttribute("data-bone")).toBe("text");
    expect(el.style.getPropertyValue("--bone-length")).toBe("12");
  });

  test("does not set --bone-length when data is available", () => {
    const { getByTestId } = render(<TestLength data={mockData} />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-length")).toBe("");
  });

  test("sets --bone-contained CSS variable for contained text", () => {
    const { getByTestId } = render(<TestContained data={forceBones} />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.style.getPropertyValue("--bone-contained")).toBe("1");
  });

  test("block sets src to transparent pixel", () => {
    const { getByTestId } = render(<TestBlock data={forceBones} />);
    const el = getByTestId("target") as HTMLElement;
    expect(el.getAttribute("src")).toBe(
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    );
  });

  test("data returns undefined with forceBones", () => {
    const { getByTestId } = render(<TestData data={forceBones} />);
    const el = getByTestId("target");
    expect(el.textContent).toBe("");
  });

  test("data returns resolved value when available", () => {
    const { getByTestId } = render(<TestData data={mockData} />);
    const el = getByTestId("target");
    expect(el.textContent).toBe("Pikachu");
  });

  test("repeat returns placeholder array with forceBones", () => {
    const { getByTestId } = render(<TestRepeat data={forceBones} />);
    const el = getByTestId("target");
    expect(el.children).toHaveLength(2);
    for (const child of el.children) {
      expect(child.getAttribute("data-bone")).toBe("text");
    }
  });

  test("repeat returns actual array when data is available", () => {
    const { getByTestId } = render(<TestRepeat data={mockListData} />);
    const el = getByTestId("target");
    expect(el.children).toHaveLength(1);
    expect(el.children[0].textContent).toBe("electric");
  });

  test("empty array is treated as loaded", () => {
    const emptyData = { name: "Pikachu", types: [] as string[] };
    const { getByTestId } = render(<TestRepeat data={emptyData} />);
    const el = getByTestId("target");
    expect(el.children).toHaveLength(0);
  });
});

describe("createBones with loading option", () => {
  function TestLoading({ data, loading }: { data?: typeof mockData; loading?: boolean }) {
    const { bone, data: resolved } = createBones(data, { loading });
    return (
      <span data-testid="target" {...bone("text")}>
        {resolved?.name}
      </span>
    );
  }

  test("shows skeleton when loading is true, even with data", () => {
    const { getByTestId } = render(<TestLoading data={mockData} loading={true} />);
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBe("text");
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.textContent).toBe("");
  });

  test("shows data when loading is false", () => {
    const { getByTestId } = render(<TestLoading data={mockData} loading={false} />);
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBeNull();
    expect(el.textContent).toBe("Pikachu");
  });

  test("shows data when loading is undefined", () => {
    const { getByTestId } = render(<TestLoading data={mockData} />);
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBeNull();
    expect(el.textContent).toBe("Pikachu");
  });

  test("shows skeleton when loading is true and data is undefined", () => {
    const { getByTestId } = render(<TestLoading loading={true} />);
    const el = getByTestId("target");
    expect(el.getAttribute("data-bone")).toBe("text");
    expect(el.textContent).toBe("");
  });
});

describe("createBones with promises", () => {
  function TestPromise({ promise }: { promise: Promise<typeof mockData> }) {
    const { bone, data } = createBones(promise);
    return (
      <span data-testid="target" {...bone("text")}>
        {data?.name}
      </span>
    );
  }

  function renderWithSuspense(promise: Promise<typeof mockData>) {
    return act(async () => {
      render(
        <Suspense fallback={<TestText data={forceBones} />}>
          <TestPromise promise={promise} />
        </Suspense>,
      );
    });
  }

  function expectResolved() {
    expect(screen.getByTestId("target").getAttribute("data-bone")).toBeNull();
    expect(screen.getByTestId("target").textContent).toBe("Pikachu");
  }

  test("shows skeleton then content when promise resolves", async () => {
    let resolve!: (value: typeof mockData) => void;
    const promise = new Promise<typeof mockData>((r) => {
      resolve = r;
    });

    await renderWithSuspense(promise);

    // Fallback renders skeleton
    expect(screen.getByTestId("target").getAttribute("data-bone")).toBe("text");

    await act(async () => {
      resolve(mockData);
    });

    expectResolved();
  });

  test("renders content immediately for already-resolved promise", async () => {
    const promise = Promise.resolve(mockData);
    await act(async () => {
      await promise;
    });

    await renderWithSuspense(promise);

    expectResolved();
  });
});
