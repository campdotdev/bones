import { act, Suspense } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { Await } from "./await";

afterEach(cleanup);

test("renders the fallback while the promise is pending", async () => {
  const pending = new Promise<string>(() => {});
  await act(async () => {
    render(
      <Suspense fallback={<p>pending</p>}>
        <Await promise={pending}>{(value) => <p>{value}</p>}</Await>
      </Suspense>,
    );
  });
  expect(screen.getByText("pending")).toBeDefined();
});

test("renders the resolved value", async () => {
  await act(async () => {
    render(
      <Suspense fallback={<p>pending</p>}>
        <Await promise={Promise.resolve("done")}>{(value) => <p>{value}</p>}</Await>
      </Suspense>,
    );
  });
  expect(await screen.findByText("done")).toBeDefined();
});
