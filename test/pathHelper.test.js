const path = require("path");
const generatePath = require("../src/helpers/pathHelper");

describe("pathHelper - generatePath", () => {
  let originalCwd;

  beforeEach(() => {
    originalCwd = process.cwd();
  });

  afterEach(() => {
    // Restore original working directory if it was changed
    if (process.cwd() !== originalCwd) {
      process.chdir(originalCwd);
    }
  });

  describe("argument parsing", () => {
    it("should return basePath when no arguments provided", () => {
      const args = ["node", "script"];
      const basePath = "/test/base/path";

      const result = generatePath(args, basePath);
      expect(result).toBe(basePath);
    });

    it("should return basePath when args length is 2 or less", () => {
      const args = ["node"];
      const basePath = "/test/base/path";

      const result = generatePath(args, basePath);
      expect(result).toBe(basePath);
    });

    it("should return basePath when third argument starts with '/'", () => {
      const args = ["node", "script", "/absolute/path"];
      const basePath = "/test/base/path";

      const result = generatePath(args, basePath);
      expect(result).toBe(basePath);
    });

    it("should join basePath with relative argument", () => {
      const args = ["node", "script", "relative/path"];
      const basePath = "/test/base/path";

      const result = generatePath(args, basePath);
      const expected = path.join(basePath, "relative/path");
      expect(result).toBe(expected);
    });

    it("should use process.cwd() as default basePath", () => {
      const args = ["node", "script", "relative/path"];

      const result = generatePath(args);
      const expected = path.join(process.cwd(), "relative/path");
      expect(result).toBe(expected);
    });
  });

  describe("edge cases", () => {
    it("should handle empty array of arguments", () => {
      const args = [];
      const basePath = "/test/base/path";

      const result = generatePath(args, basePath);
      expect(result).toBe(basePath);
    });

    it("should handle single dot as relative path", () => {
      const args = ["node", "script", "."];
      const basePath = "/test/base/path";

      const result = generatePath(args, basePath);
      const expected = path.join(basePath, ".");
      expect(result).toBe(expected);
    });

    it("should handle double dot as relative path", () => {
      const args = ["node", "script", ".."];
      const basePath = "/test/base/path";

      const result = generatePath(args, basePath);
      const expected = path.join(basePath, "..");
      expect(result).toBe(expected);
    });

    it("should handle relative path with subdirectories", () => {
      const args = ["node", "script", "sub/directory/path"];
      const basePath = "/test/base/path";

      const result = generatePath(args, basePath);
      const expected = path.join(basePath, "sub/directory/path");
      expect(result).toBe(expected);
    });

    it("should handle Windows-style paths on Unix systems", () => {
      const args = ["node", "script", "relative\\\\windows\\\\path"];
      const basePath = "/test/base/path";

      const result = generatePath(args, basePath);
      const expected = path.join(basePath, "relative\\\\windows\\\\path");
      expect(result).toBe(expected);
    });

    it("should handle paths with spaces", () => {
      const args = ["node", "script", "path with spaces"];
      const basePath = "/test/base/path";

      const result = generatePath(args, basePath);
      const expected = path.join(basePath, "path with spaces");
      expect(result).toBe(expected);
    });

    it("should handle empty string as third argument", () => {
      const args = ["node", "script", ""];
      const basePath = "/test/base/path";

      const result = generatePath(args, basePath);
      const expected = path.join(basePath, "");
      expect(result).toBe(expected);
    });
  });

  describe("real-world scenarios", () => {
    it("should work with typical npm run start arguments", () => {
      const args = ["node", "src/cli/index.js"];
      const basePath = process.cwd();

      const result = generatePath(args, basePath);
      expect(result).toBe(basePath);
    });

    it("should work with npx global execution", () => {
      const args = [
        "node",
        "/usr/local/lib/node_modules/mlgc/src/cli/index.js",
      ];
      const basePath = process.cwd();

      const result = generatePath(args, basePath);
      expect(result).toBe(basePath);
    });

    it("should work with local project execution with path", () => {
      const args = ["node", "src/cli/index.js", "src/components"];
      const basePath = process.cwd();

      const result = generatePath(args, basePath);
      const expected = path.join(basePath, "src/components");
      expect(result).toBe(expected);
    });

    it("should handle absolute paths correctly (Unix)", () => {
      const args = ["node", "script", "/home/user/project"];
      const basePath = "/different/base/path";

      const result = generatePath(args, basePath);
      expect(result).toBe(basePath); // Should return basePath, not the absolute path
    });

    it("should work with different base paths", () => {
      const args = ["node", "script", "relative"];
      const basePath1 = "/first/path";
      const basePath2 = "/second/path";

      const result1 = generatePath(args, basePath1);
      const result2 = generatePath(args, basePath2);

      expect(result1).toBe(path.join(basePath1, "relative"));
      expect(result2).toBe(path.join(basePath2, "relative"));
      expect(result1).not.toBe(result2);
    });
  });

  describe("cross-platform compatibility", () => {
    it("should use path.join for proper separator handling", () => {
      const args = ["node", "script", "sub/dir"];
      const basePath = "/base";

      const result = generatePath(args, basePath);

      // path.join should handle the separator correctly for the current platform
      expect(result).toBe(path.join(basePath, "sub/dir"));
    });

    it("should handle backslash in path on all platforms", () => {
      const args = ["node", "script", "sub\\\\dir"];
      const basePath = "/base";

      const result = generatePath(args, basePath);
      const expected = path.join(basePath, "sub\\\\dir");
      expect(result).toBe(expected);
    });
  });
});
