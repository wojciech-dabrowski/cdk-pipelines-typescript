/**
 * @jest-environment node
 */

import axios from "axios";

test("200 Response", async () => {
  const url = process.env.SERVICE_URL ?? "No SERVICE_URL in env";
  console.log("url ->", url);

  const response = await axios.get(url);

  expect(response.status).toEqual(200);
});
