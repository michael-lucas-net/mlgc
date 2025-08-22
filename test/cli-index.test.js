const { showMenu } = require("../src/cli/menu");
const { showWelcome } = require("../src/commands/welcome");

// Mock the dependencies
jest.mock("../src/cli/menu", () => ({
  showMenu: jest.fn(),
}));

jest.mock("../src/commands/welcome", () => ({
  showWelcome: jest.fn(),
}));

describe("CLI Entry Point (index.js)", () => {
  let originalArgv;

  beforeEach(() => {
    // Store original process.argv
    originalArgv = process.argv;
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original process.argv
    process.argv = originalArgv;
    jest.restoreAllMocks();
  });

  it("should call showWelcome and showMenu in correct order", () => {
    // Mock the module loading
    jest.isolateModules(() => {
      require("../src/cli/index");
    });

    expect(showWelcome).toHaveBeenCalledTimes(1);
    expect(showMenu).toHaveBeenCalledTimes(1);

    // Verify order: welcome should be called before menu
    const welcomeCall = showWelcome.mock.invocationCallOrder[0];
    const menuCall = showMenu.mock.invocationCallOrder[0];
    expect(welcomeCall).toBeLessThan(menuCall);
  });

  it("should work with no command line arguments", () => {
    process.argv = ["node", "mlgc"];

    jest.isolateModules(() => {
      require("../src/cli/index");
    });

    expect(showWelcome).toHaveBeenCalled();
    expect(showMenu).toHaveBeenCalled();
  });

  it("should work with command line arguments", () => {
    process.argv = ["node", "mlgc", "./test-directory"];

    jest.isolateModules(() => {
      require("../src/cli/index");
    });

    expect(showWelcome).toHaveBeenCalled();
    expect(showMenu).toHaveBeenCalled();
  });

  it("should not throw errors during module initialization", () => {
    expect(() => {
      jest.isolateModules(() => {
        require("../src/cli/index");
      });
    }).not.toThrow();
  });

  it("should call both functions without parameters", () => {
    jest.isolateModules(() => {
      require("../src/cli/index");
    });

    expect(showWelcome).toHaveBeenCalledWith();
    expect(showMenu).toHaveBeenCalledWith();
  });
});
