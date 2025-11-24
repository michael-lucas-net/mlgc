const fs = require("fs").promises;
const {
  createFolder,
  folderExists,
  removeFolder,
  copyFile,
} = require("../src/helpers/fileHelper");

jest.mock("fs", () => ({
  promises: {
    mkdir: jest.fn(),
    access: jest.fn(),
    rm: jest.fn(),
    copyFile: jest.fn(),
  },
}));

describe("FileHelpers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createFolder", () => {
    it("should create a folder when a valid path is provided", async () => {
      await createFolder("/valid/path");
      expect(fs.mkdir).toHaveBeenCalledWith("/valid/path", { recursive: true });
    });
  });

  describe("folderExists", () => {
    it("should return true if the folder exists", async () => {
      fs.access.mockResolvedValue();
      const exists = await folderExists("/existing/folder");
      expect(exists).toBe(true);
    });

    it("should return false if the folder does not exist", async () => {
      fs.access.mockRejectedValue(new Error("Not found"));
      const exists = await folderExists("/nonexistent/folder");
      expect(exists).toBe(false);
    });
  });

  describe("removeFolder", () => {
    it("should remove a folder if it exists", async () => {
      fs.access.mockResolvedValue();
      fs.rm.mockResolvedValue();
      await removeFolder("/existing/folder");
      expect(fs.rm).toHaveBeenCalledWith("/existing/folder", {
        recursive: true,
      });
    });

    it("should not call rm if the folder does not exist", async () => {
      fs.access.mockRejectedValue(new Error("Not found"));
      await removeFolder("/nonexistent/folder");
      expect(fs.rm).not.toHaveBeenCalled();
    });

    it("should throw an error if path is invalid", async () => {
      await expect(removeFolder("")).rejects.toThrow("Invalid path");
    });

    it("should throw an error if rm fails", async () => {
      fs.access.mockResolvedValue();
      fs.rm.mockRejectedValue(new Error("Permission denied"));
      await expect(removeFolder("/restricted/folder")).rejects.toThrow(
        "Failed to remove folder: Permission denied"
      );
    });
  });

  describe("copyFile", () => {
    it("should copy a file to the destination", async () => {
      fs.access.mockResolvedValue();
      fs.copyFile.mockResolvedValue();
      await copyFile("/source/file.txt", "/destination/file.txt");
      expect(fs.copyFile).toHaveBeenCalledWith(
        "/source/file.txt",
        "/destination/file.txt"
      );
    });

    it("should create the destination folder if it does not exist", async () => {
      fs.access.mockRejectedValue(new Error("Not found")); // Destination folder doesn't exist
      fs.mkdir.mockResolvedValue();
      fs.copyFile.mockResolvedValue();
      await copyFile("/source/file.txt", "/destination/file.txt");
      expect(fs.mkdir).toHaveBeenCalledWith("/destination", {
        recursive: true,
      });
    });

    it("should throw an error if source file is missing", async () => {
      fs.copyFile.mockRejectedValue(new Error("Source file not found"));
      await expect(
        copyFile("/missing/file.txt", "/destination/file.txt")
      ).rejects.toThrow("Failed to copy file: Source file not found");
    });

    it("should throw an error if destination path is invalid", async () => {
      await expect(copyFile("/source/file.txt", "")).rejects.toThrow(
        "Invalid path"
      );
    });

    it("should handle complex destination paths correctly", async () => {
      fs.access.mockRejectedValue(new Error("Not found"));
      fs.mkdir.mockResolvedValue();
      fs.copyFile.mockResolvedValue();
      await copyFile("/source/file.txt", "/nested/folder/destination/file.txt");
      expect(fs.mkdir).toHaveBeenCalledWith("/nested/folder/destination", {
        recursive: true,
      });
    });
  });

  describe("General error handling", () => {
    it("should handle empty path validation for createFolder", async () => {
      await expect(createFolder("")).rejects.toThrow("Invalid path");
    });

    it("should handle empty path validation for removeFolder", async () => {
      await expect(removeFolder("")).rejects.toThrow("Invalid path");
    });

    it("should handle mkdir errors in createFolder", async () => {
      const mkdirError = new Error("Permission denied");
      fs.mkdir.mockRejectedValue(mkdirError);

      await expect(createFolder("/restricted/path")).rejects.toThrow(
        "Failed to create folder: Permission denied"
      );
    });

    it("should handle different mkdir error types", async () => {
      const mkdirError = new Error("Disk full");
      fs.mkdir.mockRejectedValue(mkdirError);

      await expect(createFolder("/path")).rejects.toThrow(
        "Failed to create folder: Disk full"
      );
    });
  });

  describe("Integration tests", () => {
    it("should create, check, and remove a folder successfully", async () => {
      fs.mkdir.mockResolvedValue();
      fs.access.mockResolvedValue();
      fs.rm.mockResolvedValue();

      await createFolder("/test/folder");
      expect(await folderExists("/test/folder")).toBe(true);

      await removeFolder("/test/folder");
      expect(fs.rm).toHaveBeenCalledWith("/test/folder", { recursive: true });
    });

    it("should copy a file and ensure the destination folder exists", async () => {
      fs.access.mockRejectedValueOnce(new Error("Not found")); // Destination folder doesn't exist initially
      fs.mkdir.mockResolvedValue();
      fs.copyFile.mockResolvedValue();

      await copyFile("/source/file.txt", "/destination/folder/file.txt");
      expect(fs.mkdir).toHaveBeenCalledWith("/destination/folder", {
        recursive: true,
      });
      expect(fs.copyFile).toHaveBeenCalledWith(
        "/source/file.txt",
        "/destination/folder/file.txt"
      );
    });
  });
});
