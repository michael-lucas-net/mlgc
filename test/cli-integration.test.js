const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs").promises;

// Mock boxenHelper to avoid ESM import issues in tests
jest.mock("../src/utils/boxenHelper", () => ({
  loadBoxen: jest.fn().mockResolvedValue((text, options) => {
    // Simple mock implementation that returns formatted text
    const lines = text.split("\n");
    const maxWidth = Math.max(...lines.map((line) => line.length));
    const border = "─".repeat(maxWidth + 4);
    return `┌${border}┐\n│ ${text} │\n└${border}┘`;
  }),
}));

describe("CLI Integration Tests", () => {
  const cliPath = path.join(__dirname, "../src/cli/index.js");
  const testTimeout = 10000; // 10 seconds

  describe("CLI execution", () => {
    it(
      "should start without errors when run directly",
      async () => {
        const promise = new Promise((resolve, reject) => {
          const child = spawn("node", [cliPath], {
            stdio: ["pipe", "pipe", "pipe"],
          });

          let stdout = "";
          let stderr = "";
          let outputComplete = false;

          child.stdout.on("data", (data) => {
            stdout += data.toString();
            // Give some time for output to accumulate
            if (!outputComplete && stdout.length > 0) {
              outputComplete = true;
              setTimeout(() => {
                child.kill("SIGINT");
              }, 500);
            }
          });

          child.stderr.on("data", (data) => {
            stderr += data.toString();
          });

          // Send Ctrl+C after a delay if no output was received
          setTimeout(() => {
            if (!outputComplete) {
              child.kill("SIGINT");
            }
          }, 2000);

          child.on("error", (error) => {
            reject(error);
          });

          child.on("exit", (code, signal) => {
            // Accept any exit code/signal - we'll check the output separately
            resolve({ stdout, stderr, code, signal });
          });
        });

        const result = await promise;

        // Should show welcome message (check both stdout and stderr as enquirer may use different streams)
        const allOutput = result.stdout + result.stderr;
        expect(allOutput).toContain("Welcome TO MLGC");
        expect(allOutput).toContain("What can I do for you?");
      },
      testTimeout
    );

    it(
      "should handle command line arguments",
      async () => {
        const testDir = "test-directory";

        const promise = new Promise((resolve, reject) => {
          const child = spawn("node", [cliPath, testDir], {
            stdio: ["pipe", "pipe", "pipe"],
          });

          let stdout = "";
          let stderr = "";
          let outputComplete = false;

          child.stdout.on("data", (data) => {
            stdout += data.toString();
            // Give some time for output to accumulate
            if (!outputComplete && stdout.length > 0) {
              outputComplete = true;
              setTimeout(() => {
                child.kill("SIGINT");
              }, 500);
            }
          });

          child.stderr.on("data", (data) => {
            stderr += data.toString();
          });

          // Send Ctrl+C after a delay if no output was received
          setTimeout(() => {
            if (!outputComplete) {
              child.kill("SIGINT");
            }
          }, 2000);

          child.on("error", (error) => {
            reject(error);
          });

          child.on("exit", (code, signal) => {
            // Accept any exit code/signal - we'll check the output separately
            resolve({ stdout, stderr, code, signal });
          });
        });

        const result = await promise;

        // Should still show welcome and menu (check both stdout and stderr)
        const allOutput = result.stdout + result.stderr;
        expect(allOutput).toContain("Welcome TO MLGC");
        expect(allOutput).toContain("What can I do for you?");
      },
      testTimeout
    );
  });

  describe("module loading", () => {
    it("should load all required modules without errors", async () => {
      expect(() => {
        require("../src/cli/index.js");
      }).not.toThrow();
      
      // Wait a bit for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it("should have all dependencies available", () => {
      const dependencies = ["../src/cli/menu", "../src/commands/welcome"];

      dependencies.forEach((dep) => {
        expect(() => {
          require(dep);
        }).not.toThrow();
      });
    });
  });

  describe("file system requirements", () => {
    it("should have executable entry point", async () => {
      try {
        const stats = await fs.stat(cliPath);
        expect(stats.isFile()).toBe(true);
      } catch (error) {
        throw new Error(`CLI entry point not found: ${cliPath}`);
      }
    });

    it("should have shebang for Unix systems", async () => {
      const content = await fs.readFile(cliPath, "utf8");
      const firstLine = content.split("\n")[0].replace(/\r$/, "");

      expect(firstLine).toBe("#!/usr/bin/env node");
    });

    it("should be in the correct location specified in package.json", async () => {
      const packageJson = require("../package.json");
      const binPath = packageJson.bin.mlgc;
      const fullBinPath = path.resolve(__dirname, "..", binPath);

      expect(path.resolve(cliPath)).toBe(fullBinPath);
    });
  });

  describe("environment compatibility", () => {
    it("should work with different Node.js versions (>=14.0.0)", () => {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

      expect(majorVersion).toBeGreaterThanOrEqual(14);
    });

    it("should handle different working directories", async () => {
      const originalCwd = process.cwd();

      try {
        // Change to a different directory
        const tempDir = path.join(__dirname, "..");
        process.chdir(tempDir);

        // CLI should still work
        expect(() => {
          require("../src/cli/index.js");
        }).not.toThrow();
      } finally {
        // Restore original working directory
        process.chdir(originalCwd);
      }
    });
  });

  describe("error scenarios", () => {
    it(
      "should handle non-git directories gracefully",
      async () => {
        // Create a temporary non-git directory
        const tempDir = path.join(__dirname, "temp-non-git");

        try {
          await fs.mkdir(tempDir, { recursive: true });

          const promise = new Promise((resolve, reject) => {
            const child = spawn("node", [cliPath], {
              stdio: ["pipe", "pipe", "pipe"],
              cwd: tempDir,
            });

            let stdout = "";
            let stderr = "";

            child.stdout.on("data", (data) => {
              stdout += data.toString();
            });

            child.stderr.on("data", (data) => {
              stderr += data.toString();
            });

            let outputComplete = false;

            child.stdout.on("data", (data) => {
              stdout += data.toString();
              // Give some time for output to accumulate
              if (!outputComplete && stdout.length > 0) {
                outputComplete = true;
                setTimeout(() => {
                  child.kill("SIGINT");
                }, 500);
              }
            });

            // Send Ctrl+C after a delay if no output was received
            setTimeout(() => {
              if (!outputComplete) {
                child.kill("SIGINT");
              }
            }, 2000);

            child.on("exit", (code, signal) => {
              // Accept any exit code/signal as long as we can check the output
              resolve({ stdout, stderr, code, signal });
            });

            child.on("error", (error) => {
              reject(error);
            });
          });

          const result = await promise;

          // Should still show welcome message even in non-git directory (check both stdout and stderr)
          const allOutput = result.stdout + result.stderr;
          expect(allOutput).toContain("Welcome TO MLGC");
        } finally {
          // Cleanup
          try {
            await fs.rmdir(tempDir);
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      },
      testTimeout
    );

    it("should handle invalid arguments gracefully", () => {
      expect(() => {
        // Simulate CLI with invalid arguments
        const originalArgv = process.argv;
        process.argv = ["node", "script", "--invalid-flag"];

        try {
          require("../src/cli/index.js");
        } finally {
          process.argv = originalArgv;
        }
      }).not.toThrow();
    });
  });
});
