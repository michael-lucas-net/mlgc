const { log } = require("../src/utils/logger");
const chalk = require("chalk");

describe("Logger utility", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("log.success", () => {
    it("should log a message with the SUCCESS tag in green", () => {
      const message = "Operation completed successfully";
      log.success(message);
      expect(consoleSpy).toHaveBeenCalledWith(
        chalk.green(`[SUCCESS] ${message}`)
      );
    });

    it("should handle empty messages gracefully", () => {
      log.success("");
      expect(consoleSpy).toHaveBeenCalledWith(chalk.green("[SUCCESS] "));
    });
  });

  describe("log.info", () => {
    it("should log a message with the INFO tag in cyan", () => {
      const message = "Informational message";
      log.info(message);
      expect(consoleSpy).toHaveBeenCalledWith(chalk.cyan(`[INFO] ${message}`));
    });

    it("should handle special characters in the message", () => {
      const message = "Info: @#%&*!";
      log.info(message);
      expect(consoleSpy).toHaveBeenCalledWith(chalk.cyan(`[INFO] ${message}`));
    });
  });

  describe("log.warn", () => {
    it("should log a message with the WARN tag in yellow", () => {
      const message = "This is a warning";
      log.warn(message);
      expect(consoleSpy).toHaveBeenCalledWith(
        chalk.yellow(`[WARN] ${message}`)
      );
    });

    it("should handle undefined messages gracefully", () => {
      log.warn(undefined);
      expect(consoleSpy).toHaveBeenCalledWith(chalk.yellow("[WARN] undefined"));
    });
  });

  describe("log.error", () => {
    it("should log a message with the ERROR tag in red", () => {
      const message = "An error occurred";
      log.error(message);
      expect(consoleSpy).toHaveBeenCalledWith(chalk.red(`[ERROR] ${message}`));
    });

    it("should handle numbers as messages", () => {
      const message = 404;
      log.error(message);
      expect(consoleSpy).toHaveBeenCalledWith(chalk.red(`[ERROR] ${message}`));
    });
  });

  describe("General logging behavior", () => {
    it("should not throw errors when logging undefined messages", () => {
      expect(() => log.success(undefined)).not.toThrow();
      expect(() => log.info(undefined)).not.toThrow();
      expect(() => log.warn(undefined)).not.toThrow();
      expect(() => log.error(undefined)).not.toThrow();
    });

    it("should format messages consistently across all methods", () => {
      const message = "Consistency check";
      log.success(message);
      log.info(message);
      log.warn(message);
      log.error(message);
      expect(consoleSpy).toHaveBeenCalledWith(
        chalk.green(`[SUCCESS] ${message}`)
      );
      expect(consoleSpy).toHaveBeenCalledWith(chalk.cyan(`[INFO] ${message}`));
      expect(consoleSpy).toHaveBeenCalledWith(
        chalk.yellow(`[WARN] ${message}`)
      );
      expect(consoleSpy).toHaveBeenCalledWith(chalk.red(`[ERROR] ${message}`));
    });
  });
});
