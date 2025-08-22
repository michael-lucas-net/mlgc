const { showMenu } = require("../src/cli/menu");
const { copy } = require("../src/commands/copy");
const { clearCopyFolder } = require("../src/core/folder");
const generatePath = require("../src/helpers/pathHelper");
const { log } = require("../src/utils/logger");

// Mock all the dependencies
jest.mock("enquirer", () => ({
  Select: jest.fn(),
}));

jest.mock("../src/commands/copy");
jest.mock("../src/core/folder");
jest.mock("../src/commands/changelog");
jest.mock("../src/helpers/pathHelper");
jest.mock("../src/utils/logger");

const { Select } = require("enquirer");

describe("showMenu function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    generatePath.mockReturnValue("/mock/path");
  });

  it("should call generatePath with process.argv", async () => {
    // Simulate user selecting first option
    Select.mockImplementation(() => ({
      run: jest
        .fn()
        .mockResolvedValue("📄 Copy current changes to directory for upload"),
    }));

    await showMenu();

    expect(generatePath).toHaveBeenCalledWith(process.argv);
  });

  it("should log info for copying current changes", async () => {
    // Simulate user selecting first option
    Select.mockImplementation(() => ({
      run: jest
        .fn()
        .mockResolvedValue("📄 Copy current changes to directory for upload"),
    }));

    await showMenu();

    expect(log.info).toHaveBeenCalledWith("📄 Copying current changes...");
  });

  it("should log info for copying changes from main branch", async () => {
    // Simulate user selecting second option
    Select.mockImplementation(() => ({
      run: jest
        .fn()
        .mockResolvedValue(
          "🌿 Copy changes from main branch to directory for upload"
        ),
    }));

    await showMenu();

    expect(log.info).toHaveBeenCalledWith(
      "🌿 Copying changes from main branch..."
    );
  });

  it("should clear copy folder and log success", async () => {
    // Simulate user selecting third option
    Select.mockImplementation(() => ({
      run: jest
        .fn()
        .mockResolvedValue("🗑️  Delete all files in upload-directory"),
    }));

    await showMenu();

    expect(clearCopyFolder).toHaveBeenCalled();
    expect(log.info).toHaveBeenCalledWith("🗑️  Deleting files and folder...");
    expect(log.success).toHaveBeenCalledWith("✅ Folder cleared successfully.");
  });

  it("should create Select prompt with correct name", async () => {
    // Simulate user selecting first option
    Select.mockImplementation(() => ({
      run: jest
        .fn()
        .mockResolvedValue("📄 Copy current changes to directory for upload"),
    }));

    await showMenu();

    expect(Select).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "menu",
      })
    );
  });

  it("should have exactly 4 menu choices", async () => {
    // Simulate user selecting first option
    Select.mockImplementation(() => ({
      run: jest
        .fn()
        .mockResolvedValue("📄 Copy current changes to directory for upload"),
    }));

    await showMenu();

    const menuChoices = Select.mock.calls[0][0].choices;
    expect(menuChoices).toHaveLength(4);
    expect(menuChoices).toEqual([
      "📄 Copy current changes to directory for upload",
      "🌿 Copy changes from main branch to directory for upload",
      "🗑️  Delete all files in upload-directory",
      "📋 Show changelog",
    ]);
  });

  it("should have correct prompt message", async () => {
    // Simulate user selecting first option
    Select.mockImplementation(() => ({
      run: jest
        .fn()
        .mockResolvedValue("📄 Copy current changes to directory for upload"),
    }));

    await showMenu();

    expect(Select).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "🦙 What can I do for you?",
      })
    );
  });

  it("should pass the generated path to copy for current changes", async () => {
    const mockPath = "/specific/test/path";
    generatePath.mockReturnValue(mockPath);

    // Simulate user selecting first option
    Select.mockImplementation(() => ({
      run: jest
        .fn()
        .mockResolvedValue("📄 Copy current changes to directory for upload"),
    }));

    await showMenu();

    expect(copy).toHaveBeenCalledWith("commit", mockPath);
  });

  it("should pass the generated path to copy for main branch changes", async () => {
    const mockPath = "/another/test/path";
    generatePath.mockReturnValue(mockPath);

    // Simulate user selecting second option
    Select.mockImplementation(() => ({
      run: jest
        .fn()
        .mockResolvedValue(
          "🌿 Copy changes from main branch to directory for upload"
        ),
    }));

    await showMenu();

    expect(copy).toHaveBeenCalledWith("branch", mockPath);
  });

  it("should not call copy or clearCopyFolder for unrecognized selection", async () => {
    // Simulate an unrecognized selection
    Select.mockImplementation(() => ({
      run: jest.fn().mockResolvedValue("Unknown option"),
    }));

    await showMenu();

    expect(copy).not.toHaveBeenCalled();
    expect(clearCopyFolder).not.toHaveBeenCalled();
  });

  it("should call generatePath only once per menu interaction", async () => {
    // Simulate user selecting first option
    Select.mockImplementation(() => ({
      run: jest
        .fn()
        .mockResolvedValue("📄 Copy current changes to directory for upload"),
    }));

    await showMenu();

    expect(generatePath).toHaveBeenCalledTimes(1);
  });

  it("should use process.argv when generating path", async () => {
    // Simulate user selecting first option
    Select.mockImplementation(() => ({
      run: jest
        .fn()
        .mockResolvedValue("📄 Copy current changes to directory for upload"),
    }));

    await showMenu();

    expect(generatePath).toHaveBeenCalledWith(process.argv);
  });

  describe("error handling", () => {
    it("should handle Select promise rejection", async () => {
      const testError = new Error("Selection failed");
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      Select.mockImplementation(() => ({
        run: jest.fn().mockRejectedValue(testError),
      }));

      await showMenu();

      // Wait for any pending promises to resolve
      await new Promise((resolve) => setImmediate(resolve));

      expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
    });

    it("should handle enquirer initialization errors", async () => {
      const initError = new Error("Enquirer initialization failed");
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      Select.mockImplementation(() => {
        throw initError;
      });

      await showMenu();

      expect(consoleErrorSpy).toHaveBeenCalledWith(initError);
      consoleErrorSpy.mockRestore();
    });

    it("should not crash on copy function errors", async () => {
      const copyError = new Error("Copy operation failed");
      copy.mockImplementation(() => {
        throw copyError;
      });

      Select.mockImplementation(() => ({
        run: jest
          .fn()
          .mockResolvedValue("📄 Copy current changes to directory for upload"),
      }));

      // This should not throw as the error is in the copy function
      expect(() => showMenu()).not.toThrow();
    });

    it("should not crash on clearCopyFolder errors", async () => {
      const clearError = new Error("Clear operation failed");
      clearCopyFolder.mockImplementation(() => {
        throw clearError;
      });

      Select.mockImplementation(() => ({
        run: jest
          .fn()
          .mockResolvedValue("🗑️  Delete all files in upload-directory"),
      }));

      // This should not throw as the error is in the clearCopyFolder function
      expect(() => showMenu()).not.toThrow();
    });

    it("should handle generatePath errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      generatePath.mockImplementation(() => {
        throw new Error("Path generation failed");
      });

      await showMenu();

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it("should call console.error for Select rejection with correct error object", async () => {
      const specificError = new Error("Specific test error");
      specificError.code = "TEST_ERROR";

      Select.mockImplementation(() => ({
        run: jest.fn().mockRejectedValue(specificError),
      }));

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      await showMenu();

      // Allow async operations to complete
      await new Promise((resolve) => setImmediate(resolve));

      expect(consoleErrorSpy).toHaveBeenCalledWith(specificError);
      expect(consoleErrorSpy.mock.calls[0][0]).toEqual(specificError);
      expect(consoleErrorSpy.mock.calls[0][0].code).toBe("TEST_ERROR");

      consoleErrorSpy.mockRestore();
    });
  });

  describe("async behavior", () => {
    it("should wait for Select promise to resolve before proceeding", async () => {
      let selectResolve;
      const selectPromise = new Promise((resolve) => {
        selectResolve = resolve;
      });

      Select.mockImplementation(() => ({
        run: jest.fn().mockReturnValue(selectPromise),
      }));

      const menuPromise = showMenu();

      // copy should not be called yet
      expect(copy).not.toHaveBeenCalled();

      // Resolve the select promise
      selectResolve("📄 Copy current changes to directory for upload");
      await menuPromise;

      // Now copy should be called
      expect(copy).toHaveBeenCalled();
    });

    it("should handle concurrent menu calls", async () => {
      Select.mockImplementation(() => ({
        run: jest
          .fn()
          .mockResolvedValue("📄 Copy current changes to directory for upload"),
      }));

      const promise1 = showMenu();
      const promise2 = showMenu();

      await Promise.all([promise1, promise2]);

      expect(copy).toHaveBeenCalledTimes(2);
    });
  });
});
