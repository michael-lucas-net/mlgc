const { gitCommand } = require("../src/core/git");
const { execSync } = require("child_process");
jest.mock("child_process");
const settings = require("../config/settings");

jest.mock("../config/settings", () => ({
  "ignored-files": ["node_modules", "dist", ".env"],
}));

describe("gitCommand", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("getIgnoredFiles", () => {
    it("should generate grep commands for ignored files", () => {
      const ignoredFiles = settings["ignored-files"];
      const result = ignoredFiles
        .map((file) => `| grep -v '^${file}'`)
        .join(" ");
      expect(result).toBe(
        "| grep -v '^node_modules' | grep -v '^dist' | grep -v '^.env'"
      );
    });
  });

  describe("gitCommand function", () => {
    it("should generate a git command for branch mode", () => {
      execSync.mockReturnValue("refs/remotes/origin/main");
      const command = gitCommand("branch");
      expect(command).toContain(
        "git add -N . && git diff --name-only --diff-filter=d origin/main"
      );
    });

    it("should generate a git command for commit mode", () => {
      const command = gitCommand("commit");
      expect(command).toContain(
        "git add -N . && git diff --name-only --diff-filter=d"
      );
    });

    it("should include ignored files in the command", () => {
      const command = gitCommand("commit");
      expect(command).toContain("| grep -v '^node_modules'");
      expect(command).toContain("| grep -v '^dist'");
      expect(command).toContain("| grep -v '^.env'");
    });
  });

  describe("getMainBranch function", () => {
    it("should return the main branch name from git output", () => {
      execSync.mockReturnValue("refs/remotes/origin/main");
      const result = require("../src/core/git").getMainBranch();
      expect(result).toBe("main");
    });

    it("should return master as a fallback if git command fails", () => {
      execSync.mockImplementation(() => {
        throw new Error("Command failed");
      });
      const result = require("../src/core/git").getMainBranch();
      expect(result).toBe("master");
    });

    it("should handle unexpected git output gracefully", () => {
      execSync.mockReturnValue("unexpected/output/format");
      const result = require("../src/core/git").getMainBranch();
      expect(result).toBe("format");
    });

    it("should log an error message if the command fails", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      execSync.mockImplementation(() => {
        throw new Error("Command failed");
      });
      require("../src/core/git").getMainBranch();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error detecting main branch:",
        "Command failed"
      );
      consoleSpy.mockRestore();
    });
  });

  describe("Integration tests", () => {
    it("should generate a complete git command for branch mode", () => {
      execSync.mockReturnValue("refs/remotes/origin/main");
      const command = gitCommand("branch");
      expect(command).toBe(
        "git add -N . && git diff --name-only --diff-filter=d origin/main | grep -v '^node_modules' | grep -v '^dist' | grep -v '^.env'"
      );
    });

    it("should generate a complete git command for commit mode", () => {
      const command = gitCommand("commit");
      expect(command).toBe(
        "git add -N . && git diff --name-only --diff-filter=d | grep -v '^node_modules' | grep -v '^dist' | grep -v '^.env'"
      );
    });
  });

  it("should not break if settings object is missing", () => {
    jest.mock("../config/settings", () => ({}));
    expect(() => gitCommand("commit")).not.toThrow();
  });
});
