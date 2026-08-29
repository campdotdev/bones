import { Suspense } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { Await } from "./await";

afterEach(cleanup);

test("renders the fallback, then the resolved value", async () => {
  render(
    <Suspense fallback={<p>pending</p>}>
      <Await promise={Promise.resolve("done")}>{(value) => <p>{value}</p>}</Await>
    </Suspense>,
  );
  expect(screen.getByText("pending")).toBeDefined();
  expect(await screen.findByText("done")).toBeDefined();
});
