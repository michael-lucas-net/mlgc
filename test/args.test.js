const path = require("path");
const generatePath = require("../src/args.js"); // Pfad zu Ihrer Datei anpassen

describe("generatePath", () => {
  beforeEach(() => {
    process.argv = [];
  });

  test("returns cwd when no args are provided", () => {
    const cwd = path.join("home", "user");
    const result = generatePath([], cwd);
    expect(result).toEqual(cwd);
  });

  test("returns cwd concatenated with arg when arg is provided", () => {
    process.argv = ["", "", "testDir"];
    const cwd = path.join("home", "user");
    const result = generatePath([], cwd);
    expect(result).toEqual(path.join(cwd, "testDir"));
  });

  test("returns cwd when empty arg is provided", () => {
    process.argv = ["", "", ""];
    const cwd = path.join("home", "user");
    const result = generatePath([], cwd);
    expect(result).toEqual(cwd);
  });

  test("does not append argument if it starts with /", () => {
    process.argv = ["", "", "/testDir"];
    const cwd = path.join("home", "user");
    const result = generatePath([], cwd);
    expect(result).toEqual(cwd);
  });

  test("returns cwd when process.argv is undefined", () => {
    process.argv = undefined;
    const cwd = path.join("home", "user");
    const result = generatePath([], cwd);
    expect(result).toEqual(cwd);
  });
});
