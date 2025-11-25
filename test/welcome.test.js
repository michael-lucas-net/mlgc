const { showWelcome } = require("../src/commands/welcome");
const boxen = require("boxen");
const chalk = require("chalk");

// Mock dependencies
jest.mock("boxen");
jest.mock("chalk", () => ({
  yellow: {
    bold: jest.fn((text) => text),
  },
  gray: jest.fn((text) => text),
}));

// Store original require cache for package.json
const originalPackageJson = require("../package.json");

describe("showWelcome", () => {
  beforeEach(() => {
    // Mock console.log to prevent actual output during tests
    jest.spyOn(console, "log").mockImplementation(() => {});
    boxen.mockReturnValue("mocked-boxen-output");
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should call console.log with boxen output", () => {
    showWelcome();

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("mocked-boxen-output");
  });

  it("should call boxen with correct message structure", () => {
    showWelcome();

    expect(boxen).toHaveBeenCalledTimes(1);
    const [message] = boxen.mock.calls[0];

    expect(message).toContain("Welcome TO MLGC");
    expect(message).toContain("ML Git Changes");
    expect(message).toContain(
      "This CLI will help you collect all your git changes in one folder"
    );
  });

  it("should call boxen with correct options", () => {
    showWelcome();

    const [, options] = boxen.mock.calls[0];

    expect(options).toEqual({
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "yellow",
    });
  });

  it("should use chalk.yellow.bold for the welcome title", () => {
    showWelcome();

    expect(chalk.yellow.bold).toHaveBeenCalledWith("🦙 Welcome TO MLGC 🦙");
  });

  it("should include emoji in the welcome message", () => {
    showWelcome();

    const [message] = boxen.mock.calls[0];
    expect(message).toContain("🦙");
  });

  it("should include program description", () => {
    showWelcome();

    const [message] = boxen.mock.calls[0];
    expect(message).toContain("ML Git Changes");
    expect(message).toContain("git changes in one folder");
  });

  it("should not throw any errors", () => {
    expect(() => showWelcome()).not.toThrow();
  });

  it("should call functions in correct order", () => {
    showWelcome();

    // Verify chalk is called before boxen
    const chalkCallOrder = chalk.yellow.bold.mock.invocationCallOrder[0];
    const boxenCallOrder = boxen.mock.invocationCallOrder[0];

    expect(chalkCallOrder).toBeLessThan(boxenCallOrder);
  });

  it("should format message with proper whitespace", () => {
    showWelcome();

    const [message] = boxen.mock.calls[0];

    // Check that message starts and ends with newline for proper formatting
    expect(message.startsWith("\n")).toBe(true);
    expect(message.includes("\n\n")).toBe(true); // Should have line breaks
  });

  describe("boxen configuration", () => {
    it("should use round border style", () => {
      showWelcome();

      const [, options] = boxen.mock.calls[0];
      expect(options.borderStyle).toBe("round");
    });

    it("should use yellow border color", () => {
      showWelcome();

      const [, options] = boxen.mock.calls[0];
      expect(options.borderColor).toBe("yellow");
    });

    it("should use padding of 1", () => {
      showWelcome();

      const [, options] = boxen.mock.calls[0];
      expect(options.padding).toBe(1);
    });

    it("should use margin of 1", () => {
      showWelcome();

      const [, options] = boxen.mock.calls[0];
      expect(options.margin).toBe(1);
    });
  });

  describe("message content verification", () => {
    it("should contain all required text elements", () => {
      showWelcome();

      const [message] = boxen.mock.calls[0];

      const requiredElements = [
        "Welcome TO MLGC",
        "ML Git Changes",
        "This CLI will help you collect",
        "git changes",
        "one folder",
      ];

      requiredElements.forEach((element) => {
        expect(message).toContain(element);
      });
    });

    it("should not contain any undefined or null values", () => {
      showWelcome();

      const [message] = boxen.mock.calls[0];

      expect(message).not.toContain("undefined");
      expect(message).not.toContain("null");
      expect(message).toBeTruthy();
    });
  });

  describe("version display", () => {
    it("should display version from package.json", () => {
      showWelcome();

      const [message] = boxen.mock.calls[0];
      const expectedVersion = originalPackageJson.version;

      expect(message).toContain(`Version ${expectedVersion}`);
    });

    it("should use chalk.gray for version display", () => {
      showWelcome();

      const expectedVersion = originalPackageJson.version;
      expect(chalk.gray).toHaveBeenCalledWith(`Version ${expectedVersion}`);
    });

    it("should read version directly from package.json", () => {
      // Verify that the version comes from the actual package.json
      const packageJson = require("../package.json");
      showWelcome();

      const [message] = boxen.mock.calls[0];
      expect(message).toContain(`Version ${packageJson.version}`);
    });

    it("should automatically reflect current package.json version", () => {
      // This test verifies that the version is read from package.json at runtime
      // If package.json changes, this test will automatically use the new version
      const currentVersion = require("../package.json").version;
      showWelcome();

      const [message] = boxen.mock.calls[0];
      expect(message).toContain(`Version ${currentVersion}`);
      
      // Verify it matches the actual package.json version
      expect(currentVersion).toBe(originalPackageJson.version);
    });

    it("should include version in the message structure", () => {
      showWelcome();

      const [message] = boxen.mock.calls[0];
      const versionRegex = /Version \d+\.\d+\.\d+/;

      expect(message).toMatch(versionRegex);
    });

    it("should display version between title and description", () => {
      showWelcome();

      const [message] = boxen.mock.calls[0];
      const lines = message.split("\n").map((line) => line.trim());

      const titleIndex = lines.findIndex((line) => line.includes("Welcome TO MLGC"));
      const versionIndex = lines.findIndex((line) => line.startsWith("Version"));
      const descriptionIndex = lines.findIndex((line) => line.includes("ML Git Changes"));

      expect(titleIndex).toBeGreaterThan(-1);
      expect(versionIndex).toBeGreaterThan(-1);
      expect(descriptionIndex).toBeGreaterThan(-1);
      expect(versionIndex).toBeGreaterThan(titleIndex);
      expect(descriptionIndex).toBeGreaterThan(versionIndex);
    });

    it("should handle version format correctly", () => {
      showWelcome();

      const [message] = boxen.mock.calls[0];
      const versionMatch = message.match(/Version ([\d.]+)/);

      expect(versionMatch).not.toBeNull();
      expect(versionMatch[1]).toMatch(/^\d+\.\d+\.\d+$/); // Format: x.y.z
    });
  });
});
