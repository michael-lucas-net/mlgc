const { ProgressBar } = require("../src/utils/progressBar");
const cliProgress = require("cli-progress");

// Mock cli-progress
jest.mock("cli-progress");

describe("ProgressBar", () => {
  let mockBar;
  let consoleLogSpy;
  let originalDateNow;

  beforeEach(() => {
    // Mock console.log
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Mock cli-progress SingleBar
    mockBar = {
      start: jest.fn(),
      update: jest.fn(),
      stop: jest.fn(),
    };

    cliProgress.SingleBar = jest.fn().mockImplementation(() => mockBar);
    cliProgress.Presets = {
      shades_classic: {},
    };

    // Mock Date.now() für Zeit-Tests
    originalDateNow = Date.now;
    jest.spyOn(Date, "now").mockReturnValue(1000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Date.now = originalDateNow;
  });

  describe("Constructor", () => {
    it("should initialize progress bar with correct total", () => {
      const total = 10;
      const progressBar = new ProgressBar(total);

      expect(cliProgress.SingleBar).toHaveBeenCalled();
      expect(mockBar.start).toHaveBeenCalledWith(total, 0, {
        filename: "Initializing...",
      });
      expect(progressBar.total).toBe(total);
      expect(progressBar.current).toBe(0);
    });

    it("should initialize with 0 total", () => {
      const progressBar = new ProgressBar(0);

      expect(mockBar.start).toHaveBeenCalledWith(0, 0, {
        filename: "Initializing...",
      });
      expect(progressBar.total).toBe(0);
    });

    it("should initialize with large total", () => {
      const total = 10000;
      const progressBar = new ProgressBar(total);

      expect(mockBar.start).toHaveBeenCalledWith(total, 0, {
        filename: "Initializing...",
      });
      expect(progressBar.total).toBe(total);
    });

    it("should output a newline before starting", () => {
      new ProgressBar(5);
      expect(consoleLogSpy).toHaveBeenCalledWith();
    });

    it("should merge custom options with defaults", () => {
      const customOptions = {
        format: "Custom format",
        hideCursor: false,
      };
      new ProgressBar(5, customOptions);

      expect(cliProgress.SingleBar).toHaveBeenCalledWith(
        expect.objectContaining({
          format: "Custom format",
          hideCursor: false,
        }),
        cliProgress.Presets.shades_classic
      );
    });
  });

  describe("update method", () => {
    let progressBar;

    beforeEach(() => {
      progressBar = new ProgressBar(10);
      jest.clearAllMocks();
    });

    it("should update progress bar with current value and filename", () => {
      Date.now.mockReturnValue(1001000); // 1 second later

      progressBar.update(5, "test.js");

      expect(progressBar.current).toBe(5);
      expect(progressBar.currentFile).toBe("test.js");
      expect(mockBar.update).toHaveBeenCalledWith(5, {
        filename: "test.js",
        duration: 1,
        eta: expect.any(Number),
      });
    });

    it("should calculate ETA correctly when current > 0", () => {
      // Simuliere: 2 Sekunden für 2 Dateien = 1 Sekunde pro Datei
      Date.now.mockReturnValueOnce(1000000); // Start
      progressBar = new ProgressBar(10);
      Date.now.mockReturnValueOnce(1002000); // Nach 2 Sekunden, 2 Dateien fertig

      progressBar.update(2, "file1.js");

      const callArgs = mockBar.update.mock.calls[0];
      expect(callArgs[1].eta).toBe(8); // 8 verbleibende Dateien * 1 Sekunde = 8 Sekunden
    });

    it("should show '?' as ETA when current is 0", () => {
      Date.now.mockReturnValue(1001000);

      progressBar.update(0, "test.js");

      expect(mockBar.update).toHaveBeenCalledWith(0, {
        filename: "test.js",
        duration: 1,
        eta: "?",
      });
    });

    it("should use previous filename if no filename provided", () => {
      Date.now.mockReturnValue(1001000);
      progressBar.currentFile = "previous.js";

      progressBar.update(3);

      expect(mockBar.update).toHaveBeenCalledWith(3, {
        filename: "previous.js",
        duration: 1,
        eta: expect.any(Number),
      });
    });

    it("should handle empty filename string", () => {
      Date.now.mockReturnValue(1001000);

      progressBar.update(1, "");

      expect(mockBar.update).toHaveBeenCalledWith(1, {
        filename: "",
        duration: 1,
        eta: expect.any(Number),
      });
    });

    it("should handle very long filenames", () => {
      Date.now.mockReturnValue(1001000);
      const longFilename = "a".repeat(200) + ".js";

      progressBar.update(1, longFilename);

      expect(mockBar.update).toHaveBeenCalledWith(1, {
        filename: longFilename,
        duration: 1,
        eta: expect.any(Number),
      });
    });

    it("should round duration correctly", () => {
      // Startzeit wurde im beforeEach auf 1000000 gesetzt
      // 1.5 Sekunden später = 1001500
      Date.now.mockReturnValue(1001500);

      progressBar.update(1, "test.js");

      expect(mockBar.update).toHaveBeenCalledWith(1, {
        filename: "test.js",
        duration: 2, // 1.5 Sekunden gerundet = 2
        eta: expect.any(Number),
      });
    });

    it("should calculate ETA correctly for different progress rates", () => {
      // Simuliere langsamere Rate: 5 Sekunden für 1 Datei
      Date.now.mockReturnValueOnce(1000000);
      progressBar = new ProgressBar(10);
      Date.now.mockReturnValueOnce(1005000); // 5 Sekunden später

      progressBar.update(1, "slow.js");

      const callArgs = mockBar.update.mock.calls[0];
      expect(callArgs[1].eta).toBe(45); // 9 verbleibende * 5 Sekunden = 45 Sekunden
    });
  });

  describe("increment method", () => {
    let progressBar;

    beforeEach(() => {
      progressBar = new ProgressBar(10);
      jest.clearAllMocks();
      Date.now.mockReturnValue(1001000);
    });

    it("should increment current value by 1", () => {
      progressBar.current = 3;

      progressBar.increment("newfile.js");

      expect(progressBar.current).toBe(4);
      expect(mockBar.update).toHaveBeenCalledWith(4, {
        filename: "newfile.js",
        duration: 1,
        eta: expect.any(Number),
      });
    });

    it("should work without filename parameter", () => {
      progressBar.current = 5;

      progressBar.increment();

      expect(progressBar.current).toBe(6);
      expect(mockBar.update).toHaveBeenCalledWith(6, {
        filename: "",
        duration: 1,
        eta: expect.any(Number),
      });
    });

    it("should increment from 0 to 1", () => {
      progressBar.current = 0;

      progressBar.increment("first.js");

      expect(progressBar.current).toBe(1);
    });

    it("should increment multiple times correctly", () => {
      progressBar.current = 0;

      progressBar.increment("file1.js");
      progressBar.increment("file2.js");
      progressBar.increment("file3.js");

      expect(progressBar.current).toBe(3);
      expect(mockBar.update).toHaveBeenCalledTimes(3);
    });
  });

  describe("stop method", () => {
    it("should stop the progress bar", () => {
      const progressBar = new ProgressBar(10);

      progressBar.stop();

      expect(mockBar.stop).toHaveBeenCalled();
    });

    it("should be safe to call stop multiple times", () => {
      const progressBar = new ProgressBar(5);

      progressBar.stop();
      progressBar.stop();
      progressBar.stop();

      expect(mockBar.stop).toHaveBeenCalledTimes(3);
    });
  });

  describe("getElapsedTime method", () => {
    it("should return elapsed time in seconds", () => {
      Date.now.mockReturnValueOnce(1000000); // Start
      const progressBar = new ProgressBar(10);
      Date.now.mockReturnValueOnce(1005000); // 5 Sekunden später

      const elapsed = progressBar.getElapsedTime();

      expect(elapsed).toBe(5);
    });

    it("should return 0 immediately after creation", () => {
      Date.now.mockReturnValue(1000000);
      const progressBar = new ProgressBar(10);

      const elapsed = progressBar.getElapsedTime();

      expect(elapsed).toBe(0);
    });

    it("should return correct time after operations", () => {
      Date.now.mockReturnValueOnce(1000000);
      const progressBar = new ProgressBar(10);
      Date.now.mockReturnValueOnce(1002000);
      progressBar.update(1, "test.js");
      Date.now.mockReturnValueOnce(1005000);

      const elapsed = progressBar.getElapsedTime();

      expect(elapsed).toBe(5);
    });

    it("should return fractional seconds correctly", () => {
      Date.now.mockReturnValueOnce(1000000);
      const progressBar = new ProgressBar(10);
      Date.now.mockReturnValueOnce(1000123); // 0.123 Sekunden

      const elapsed = progressBar.getElapsedTime();

      expect(elapsed).toBeCloseTo(0.123, 3);
    });
  });

  describe("Edge cases", () => {
    it("should handle total of 1 correctly", () => {
      const progressBar = new ProgressBar(1);

      expect(progressBar.total).toBe(1);
      expect(mockBar.start).toHaveBeenCalledWith(1, 0, {
        filename: "Initializing...",
      });
    });

    it("should handle update with current equal to total", () => {
      Date.now.mockReturnValueOnce(1000000);
      const progressBar = new ProgressBar(5);
      Date.now.mockReturnValueOnce(1001000);

      progressBar.update(5, "last.js");

      expect(progressBar.current).toBe(5);
      expect(mockBar.update).toHaveBeenCalled();
    });

    it("should handle update with current greater than total", () => {
      Date.now.mockReturnValueOnce(1000000);
      const progressBar = new ProgressBar(5);
      Date.now.mockReturnValueOnce(1001000);

      progressBar.update(10, "extra.js");

      expect(progressBar.current).toBe(10);
      expect(mockBar.update).toHaveBeenCalled();
    });

    it("should handle negative current value", () => {
      Date.now.mockReturnValueOnce(1000000);
      const progressBar = new ProgressBar(5);
      Date.now.mockReturnValueOnce(1001000);

      progressBar.update(-1, "test.js");

      expect(progressBar.current).toBe(-1);
      expect(mockBar.update).toHaveBeenCalled();
    });

    it("should handle special characters in filename", () => {
      Date.now.mockReturnValueOnce(1000000);
      const progressBar = new ProgressBar(5);
      Date.now.mockReturnValueOnce(1001000);

      const specialFilename = "test@#$%^&*()[]{}|\\:;\"'<>?,./.js";

      progressBar.update(1, specialFilename);

      expect(mockBar.update).toHaveBeenCalledWith(1, {
        filename: specialFilename,
        duration: 1,
        eta: expect.any(Number),
      });
    });

    it("should handle unicode characters in filename", () => {
      Date.now.mockReturnValueOnce(1000000);
      const progressBar = new ProgressBar(5);
      Date.now.mockReturnValueOnce(1001000);

      const unicodeFilename = "测试文件🚀🎉.js";

      progressBar.update(1, unicodeFilename);

      expect(mockBar.update).toHaveBeenCalledWith(1, {
        filename: unicodeFilename,
        duration: 1,
        eta: expect.any(Number),
      });
    });

    it("should handle very fast updates (same timestamp)", () => {
      Date.now.mockReturnValueOnce(1000000);
      const progressBar = new ProgressBar(10);
      Date.now.mockReturnValue(1000000); // Gleiche Zeit

      progressBar.update(1, "fast1.js");
      progressBar.update(2, "fast2.js");
      progressBar.update(3, "fast3.js");

      expect(progressBar.current).toBe(3);
      expect(mockBar.update).toHaveBeenCalledTimes(3);
    });

    it("should handle ETA calculation when remaining is 0", () => {
      Date.now.mockReturnValueOnce(1000000);
      const progressBar = new ProgressBar(5);
      Date.now.mockReturnValueOnce(1001000);

      progressBar.update(5, "last.js");

      const callArgs = mockBar.update.mock.calls[0];
      expect(callArgs[1].eta).toBe(0); // Keine verbleibenden Dateien
    });

    it("should handle zero elapsed time correctly", () => {
      Date.now.mockReturnValueOnce(1000000);
      const progressBar = new ProgressBar(10);
      // Gleiche Zeit = 0 Sekunden vergangen
      Date.now.mockReturnValue(1000000);

      progressBar.update(1, "test.js");

      // Wenn current > 0, wird ETA berechnet (auch wenn duration 0 ist)
      expect(mockBar.update).toHaveBeenCalledWith(1, {
        filename: "test.js",
        duration: 0,
        eta: 0, // 0 verbleibende Dateien * 0 Sekunden = 0
      });
    });

    it("should show '?' as ETA when current is 0 and duration is 0", () => {
      Date.now.mockReturnValueOnce(1000000);
      const progressBar = new ProgressBar(10);
      Date.now.mockReturnValue(1000000); // Gleiche Zeit

      progressBar.update(0, "test.js");

      expect(mockBar.update).toHaveBeenCalledWith(0, {
        filename: "test.js",
        duration: 0,
        eta: "?",
      });
    });
  });

  describe("Integration scenarios", () => {
    it("should complete a full copy cycle", () => {
      Date.now.mockReturnValueOnce(1000000);
      const progressBar = new ProgressBar(3);

      Date.now.mockReturnValueOnce(1001000);
      progressBar.increment("file1.js");

      Date.now.mockReturnValueOnce(1002000);
      progressBar.increment("file2.js");

      Date.now.mockReturnValueOnce(1003000);
      progressBar.increment("file3.js");

      Date.now.mockReturnValueOnce(1003000);
      progressBar.stop();

      expect(progressBar.current).toBe(3);
      expect(mockBar.update).toHaveBeenCalledTimes(3);
      expect(mockBar.stop).toHaveBeenCalled();
      expect(progressBar.getElapsedTime()).toBe(3);
    });

    it("should handle mixed update and increment calls", () => {
      Date.now.mockReturnValueOnce(1000000);
      const progressBar = new ProgressBar(5);

      Date.now.mockReturnValueOnce(1001000);
      progressBar.update(2, "batch1.js");

      Date.now.mockReturnValueOnce(1002000);
      progressBar.increment("file3.js");

      Date.now.mockReturnValueOnce(1003000);
      progressBar.update(5, "done.js");

      expect(progressBar.current).toBe(5);
      expect(mockBar.update).toHaveBeenCalledTimes(3);
    });
  });
});

