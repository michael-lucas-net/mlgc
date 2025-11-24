const { clearFolder, clearCopyFolder } = require("../src/core/folder");
const fileHelper = require("../src/helpers/fileHelper");
const { log } = require("../src/utils/logger");
const settings = require("../config/settings");
const path = require("path");

jest.mock("../src/helpers/fileHelper");
jest.mock("../src/utils/logger");
jest.mock("../config/settings", () => ({
  "upload-folder-name": "___CHANGES_TO_UPLOAD___",
}));

describe("folder functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("clearCopyFolder", () => {
    it("should call clearFolder with correct upload folder path", async () => {
      const originalCwd = process.cwd();
      fileHelper.removeFolder.mockResolvedValue();

      await clearCopyFolder();

      const expectedPath = path.join(originalCwd, settings["upload-folder-name"]);
      expect(fileHelper.removeFolder).toHaveBeenCalledWith(expectedPath);
    });
  });

  describe("clearFolder", () => {
    it("should call removeFolder with the given path", async () => {
      fileHelper.removeFolder.mockResolvedValue();

      await clearFolder("/test/path");

      expect(fileHelper.removeFolder).toHaveBeenCalledWith("/test/path");
    });

    it("should log error when removeFolder fails", async () => {
      const error = new Error("Permission denied");
      fileHelper.removeFolder.mockRejectedValue(error);

      await clearFolder("/test/path");

      expect(log.error).toHaveBeenCalledWith(
        "Failed to clear folder: Permission denied"
      );
    });

    it("should not throw when removeFolder fails", async () => {
      const error = new Error("Folder not found");
      fileHelper.removeFolder.mockRejectedValue(error);

      await expect(clearFolder("/test/path")).resolves.not.toThrow();
      expect(log.error).toHaveBeenCalled();
    });

    it("should handle different error messages", async () => {
      const error = new Error("Access denied");
      fileHelper.removeFolder.mockRejectedValue(error);

      await clearFolder("/restricted/path");

      expect(log.error).toHaveBeenCalledWith(
        "Failed to clear folder: Access denied"
      );
    });
  });
});

