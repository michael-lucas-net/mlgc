const { copySelective, filterFilesByType } = require("../src/commands/copy");
const { exec } = require("child_process");
const { log } = require("../src/utils/logger");
const fileHelper = require("../src/helpers/fileHelper");
const settings = require("../config/settings");
// const exp = require("constants"); // Removed unused import

jest.mock("child_process");
jest.mock("../src/utils/logger");
jest.mock("../src/helpers/fileHelper");
jest.mock("../src/core/folder");
jest.mock("../config/settings", () => ({
  "upload-folder-name": "uploads",
  "ignored-files": ["node_modules", "dist", ".env"],
}));

jest.mock("enquirer", () => ({
  Select: jest.fn(),
  MultiSelect: jest.fn(),
}));

jest.mock("../src/utils/boxenHelper", () => ({
  loadBoxen: jest.fn().mockResolvedValue((text, options) => {
    // Simple mock implementation that returns formatted text
    const lines = text.split("\n");
    const maxWidth = Math.max(...lines.map((line) => line.length));
    const border = "─".repeat(maxWidth + 4);
    return `┌${border}┐\n│ ${text} │\n└${border}┘`;
  }),
}));

const { clearCopyFolder } = require("../src/core/folder");

describe("filterFilesByType function", () => {
  it("should return all files when filter is 'all'", () => {
    const files = ["file1.js", "file2.ts", "file3.txt"];
    const result = filterFilesByType(files, "all");
    expect(result).toEqual(files);
  });

  it("should filter files by single file type", () => {
    const files = ["file1.js", "file2.ts", "file3.js", "file4.txt"];
    const result = filterFilesByType(files, ".js");
    expect(result).toEqual(["file1.js", "file3.js"]);
  });

  it("should filter files by file type without dot", () => {
    const files = ["file1.js", "file2.ts", "file3.js"];
    const result = filterFilesByType(files, "js");
    expect(result).toEqual(["file1.js", "file3.js"]);
  });

  it("should filter files by multiple file types", () => {
    const files = ["file1.js", "file2.ts", "file3.jsx", "file4.txt"];
    const result = filterFilesByType(files, [".js", ".ts"]);
    expect(result).toEqual(["file1.js", "file2.ts"]);
  });

  it("should return empty array when no files match", () => {
    const files = ["file1.js", "file2.ts"];
    const result = filterFilesByType(files, ".txt");
    expect(result).toEqual([]);
  });

  it("should handle case insensitive file extensions", () => {
    const files = ["file1.JS", "file2.js", "file3.Ts"];
    const result = filterFilesByType(files, ".js");
    expect(result).toEqual(["file1.JS", "file2.js"]);
  });

  it("should handle files without extensions", () => {
    const files = ["file1.js", "file2", "file3.ts"];
    const result = filterFilesByType(files, ".js");
    expect(result).toEqual(["file1.js"]);
  });
});

describe("copySelective function", () => {
  const { Select, MultiSelect } = require("enquirer");

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    clearCopyFolder.mockResolvedValue(undefined);
    // Reset settings to default
    settings["upload-folder-name"] = "uploads";
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should change the directory to the given path", async () => {
    const path = process.cwd();
    const chdirSpy = jest.spyOn(process, "chdir");

    const execMock = jest.fn((command, callback) => {
      callback(null, "file1.js\nfile2.ts");
    });
    require("child_process").exec = execMock;

    Select.mockImplementation(() => ({
      run: jest.fn().mockResolvedValue("all"),
    }));

    MultiSelect.mockImplementation(() => ({
      run: jest.fn().mockResolvedValue([]),
    }));

    await copySelective("branch", path);
    expect(chdirSpy).toHaveBeenCalledWith(path);
  });

  it("should log info if no changes are found", async () => {
    const execMock = jest.fn((command, callback) => {
      callback(null, "");
    });
    require("child_process").exec = execMock;

    await copySelective("branch", process.cwd());
    expect(log.info).toHaveBeenCalledWith("No changes found.");
  });

  it("should handle git command error gracefully", async () => {
    const execMock = jest.fn((command, callback) => {
      callback(new Error("Git command failed"), null);
    });
    require("child_process").exec = execMock;

    const warnMock = jest.spyOn(log, "warn").mockImplementation(() => {});

    const originalChdir = process.chdir;
    process.chdir = jest.fn();

    await copySelective("branch", process.cwd());

    expect(warnMock).toHaveBeenCalledWith("No changes found.");

    process.chdir = originalChdir;
  });

  it("should have all files pre-selected by default", async () => {
    const files = ["file1.js", "file2.ts", "file3.js", "file4.txt"];

    const execMock = jest.fn((command, callback) => {
      callback(null, files.join("\n"));
    });
    require("child_process").exec = execMock;

    Select.mockImplementation(() => ({
      run: jest.fn().mockResolvedValue("all"),
    }));

    const filteredFiles = files;
    MultiSelect.mockImplementation((config) => {
      // Verify that initial contains all filtered files
      expect(config.initial).toEqual(filteredFiles);
      return {
        run: jest.fn().mockResolvedValue(filteredFiles),
      };
    });

    const originalChdir = process.chdir;
    process.chdir = jest.fn();

    fileHelper.copyFile = jest.fn().mockResolvedValue(undefined);

    await copySelective("branch", process.cwd());

    expect(fileHelper.copyFile).toHaveBeenCalledTimes(files.length);
    process.chdir = originalChdir;
  });

  it("should filter files and copy selected ones", async () => {
    const files = ["file1.js", "file2.ts", "file3.js", "file4.txt"];

    const execMock = jest.fn((command, callback) => {
      callback(null, files.join("\n"));
    });
    require("child_process").exec = execMock;

    Select.mockImplementation(() => ({
      run: jest.fn().mockResolvedValue(".js"),
    }));

    const filteredFiles = ["file1.js", "file3.js"];
    MultiSelect.mockImplementation((config) => {
      // Verify that initial contains all filtered files
      expect(config.initial).toEqual(filteredFiles);
      return {
        run: jest.fn().mockResolvedValue(["file1.js", "file3.js"]),
      };
    });

    const originalChdir = process.chdir;
    process.chdir = jest.fn();

    fileHelper.copyFile = jest.fn().mockResolvedValue(undefined);

    await copySelective("branch", process.cwd());

    expect(fileHelper.copyFile).toHaveBeenCalledTimes(2);
    expect(fileHelper.copyFile).toHaveBeenCalledWith(
      "file1.js",
      expect.stringContaining("file1.js")
    );
    expect(fileHelper.copyFile).toHaveBeenCalledWith(
      "file3.js",
      expect.stringContaining("file3.js")
    );

    process.chdir = originalChdir;
  });

  it("should handle 'all' filter option", async () => {
    const files = ["file1.js", "file2.ts", "file3.txt"];

    const execMock = jest.fn((command, callback) => {
      callback(null, files.join("\n"));
    });
    require("child_process").exec = execMock;

    Select.mockImplementation(() => ({
      run: jest.fn().mockResolvedValue("all"),
    }));

    MultiSelect.mockImplementation((config) => {
      // Verify that initial contains all files when filter is "all"
      expect(config.initial).toEqual(files);
      return {
        run: jest.fn().mockResolvedValue(["file1.js", "file2.ts"]),
      };
    });

    const originalChdir = process.chdir;
    process.chdir = jest.fn();

    fileHelper.copyFile = jest.fn().mockResolvedValue(undefined);

    await copySelective("branch", process.cwd());

    expect(fileHelper.copyFile).toHaveBeenCalledTimes(2);
    expect(fileHelper.copyFile).toHaveBeenCalledWith(
      "file1.js",
      expect.stringContaining("file1.js")
    );
    expect(fileHelper.copyFile).toHaveBeenCalledWith(
      "file2.ts",
      expect.stringContaining("file2.ts")
    );

    process.chdir = originalChdir;
  });

  it("should log info when no files match filter", async () => {
    const files = ["file1.js", "file2.ts"];

    const execMock = jest.fn((command, callback) => {
      callback(null, files.join("\n"));
    });
    require("child_process").exec = execMock;

    Select.mockImplementation(() => ({
      run: jest.fn().mockResolvedValue(".txt"),
    }));

    const originalChdir = process.chdir;
    process.chdir = jest.fn();

    const infoMock = jest.spyOn(log, "info").mockImplementation(() => {});

    await copySelective("branch", process.cwd());

    expect(infoMock).toHaveBeenCalledWith(
      "No files found for filter: .txt"
    );
    expect(fileHelper.copyFile).not.toHaveBeenCalled();

    process.chdir = originalChdir;
  });

  it("should log info when no files are selected", async () => {
    const files = ["file1.js", "file2.ts"];

    const execMock = jest.fn((command, callback) => {
      callback(null, files.join("\n"));
    });
    require("child_process").exec = execMock;

    Select.mockImplementation(() => ({
      run: jest.fn().mockResolvedValue("all"),
    }));

    MultiSelect.mockImplementation(() => ({
      run: jest.fn().mockResolvedValue([]),
    }));

    const originalChdir = process.chdir;
    process.chdir = jest.fn();

    const infoMock = jest.spyOn(log, "info").mockImplementation(() => {});

    await copySelective("branch", process.cwd());

    expect(infoMock).toHaveBeenCalledWith("No files selected.");
    expect(fileHelper.copyFile).not.toHaveBeenCalled();

    process.chdir = originalChdir;
  });

  it("should handle file copy failures", async () => {
    const files = ["file1.js", "file2.js"];

    const execMock = jest.fn((command, callback) => {
      callback(null, files.join("\n"));
    });
    require("child_process").exec = execMock;

    Select.mockImplementation(() => ({
      run: jest.fn().mockResolvedValue("all"),
    }));

    MultiSelect.mockImplementation((config) => {
      // Verify that initial contains all files
      expect(config.initial).toEqual(files);
      return {
        run: jest.fn().mockResolvedValue(["file1.js", "file2.js"]),
      };
    });

    const originalChdir = process.chdir;
    process.chdir = jest.fn();

    fileHelper.copyFile = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Copy failed"));

    const warnMock = jest.spyOn(log, "warn").mockImplementation(() => {});

    await copySelective("branch", process.cwd());

    expect(warnMock).toHaveBeenCalledWith("Failed to copy file: Copy failed");
    expect(fileHelper.copyFile).toHaveBeenCalledTimes(2);

    process.chdir = originalChdir;
  });

  it("should display success message after copying files", async () => {
    const files = ["file1.js", "file2.js"];

    const execMock = jest.fn((command, callback) => {
      callback(null, files.join("\n"));
    });
    require("child_process").exec = execMock;

    Select.mockImplementation(() => ({
      run: jest.fn().mockResolvedValue("all"),
    }));

    MultiSelect.mockImplementation((config) => {
      // Verify that initial contains all files
      expect(config.initial).toEqual(files);
      return {
        run: jest.fn().mockResolvedValue(["file1.js", "file2.js"]),
      };
    });

    const originalChdir = process.chdir;
    process.chdir = jest.fn();

    fileHelper.copyFile = jest.fn().mockResolvedValue(undefined);

    const successMock = jest.spyOn(log, "success").mockImplementation(() => {});
    const consoleLogMock = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await copySelective("branch", process.cwd());

    expect(successMock).toHaveBeenCalled();
    expect(consoleLogMock).toHaveBeenCalled();
    expect(fileHelper.copyFile).toHaveBeenCalledTimes(2);

    process.chdir = originalChdir;
    consoleLogMock.mockRestore();
  });

  it("should handle cancellation gracefully", async () => {
    const files = ["file1.js", "file2.ts"];

    const execMock = jest.fn((command, callback) => {
      callback(null, files.join("\n"));
    });
    require("child_process").exec = execMock;

    Select.mockImplementation(() => ({
      run: jest.fn().mockRejectedValue({ name: "ENOENT", message: "cancelled" }),
    }));

    const originalChdir = process.chdir;
    process.chdir = jest.fn();

    const infoMock = jest.spyOn(log, "info").mockImplementation(() => {});

    await copySelective("branch", process.cwd());

    expect(infoMock).toHaveBeenCalledWith("Selection cancelled.");
    expect(fileHelper.copyFile).not.toHaveBeenCalled();

    process.chdir = originalChdir;
  });
});
