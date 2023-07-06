const fs = require("fs").promises;
jest.mock("fs", () => ({
  promises: { mkdir: jest.fn(), access: jest.fn(), rm: jest.fn() },
}));

const {
  createFolder,
  folderExists,
  removeFolder,
} = require("../src/fileHelper.js"); // Pfad zu Ihrer Datei anpassen

describe("folder operations", () => {
  const folderPath = "test/folder";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createFolder", () => {
    it("should call fs.mkdir with the correct parameters", async () => {
      await createFolder(folderPath);
      expect(fs.mkdir).toHaveBeenCalledWith(folderPath, { recursive: true });
    });

    it("should throw error if fs.mkdir fails", async () => {
      fs.mkdir.mockRejectedValue(new Error());
      await expect(createFolder(folderPath)).rejects.toThrow();
    });
    it("should throw the same error as fs.mkdir when it fails", async () => {
      const error = new Error("mkdir error");
      fs.mkdir.mockRejectedValue(error);
      await expect(createFolder(folderPath)).rejects.toThrow(error);
    });

    it("should throw a specific error when path is undefined", async () => {
      await expect(createFolder()).rejects.toThrow("Path is undefined");
    });

    it("should throw a specific error when path is null", async () => {
      await expect(createFolder(null)).rejects.toThrow("Path is null");
    });

    it("should throw a specific error when path is an empty string", async () => {
      await expect(createFolder("")).rejects.toThrow("Path is an empty string");
    });

    it("should not throw an error when fs.mkdir succeeds", async () => {
      fs.mkdir.mockResolvedValue();
      await expect(createFolder(folderPath)).resolves.not.toThrow();
    });
  });

  describe("folderExists", () => {
    it("should return true if fs.access succeeds", async () => {
      fs.access.mockResolvedValue();
      const result = await folderExists(folderPath);
      expect(result).toBe(true);
    });

    it("should return false if fs.access fails", async () => {
      fs.access.mockRejectedValue(new Error());
      const result = await folderExists(folderPath);
      expect(result).toBe(false);
    });

    it("should return false when path is undefined", async () => {
      fs.access.mockRejectedValue(new Error());
      const result = await folderExists();
      expect(result).toBe(false);
    });

    it("should return false when path is null", async () => {
      fs.access.mockRejectedValue(new Error());
      const result = await folderExists(null);
      expect(result).toBe(false);
    });

    it("should return false when path is an empty string", async () => {
      fs.access.mockRejectedValue(new Error());
      const result = await folderExists("");
      expect(result).toBe(false);
    });

    it("should not throw an error when fs.access succeeds", async () => {
      fs.access.mockResolvedValue();
      await expect(folderExists(folderPath)).resolves.not.toThrow();
    });
  });

  describe("removeFolder", () => {
    it("should call fs.rm if folder exists", async () => {
      fs.access.mockResolvedValue();
      await removeFolder(folderPath);
      expect(fs.rm).toHaveBeenCalledWith(folderPath, { recursive: true });
    });

    it("should not call fs.rm if folder does not exist", async () => {
      fs.access.mockRejectedValue(new Error());
      await removeFolder(folderPath);
      expect(fs.rm).not.toHaveBeenCalled();
    });
  });
});
