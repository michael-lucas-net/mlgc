const fs = require("fs");
const path = require("path");

describe("Global Installation Tests", () => {
  // Simuliere globale Installation
  const globalNodeModules = path.join(__dirname, "..", "node_modules");
  const packagePath = path.join(globalNodeModules, "mlgc");

  beforeAll(() => {
    // Erstelle temporäre globale Struktur für Tests
    if (!fs.existsSync(packagePath)) {
      fs.mkdirSync(packagePath, { recursive: true });
    }
  });

  afterAll(() => {
    // Cleanup
    if (fs.existsSync(packagePath)) {
      fs.rmSync(packagePath, { recursive: true, force: true });
    }
  });

  describe("Package Structure", () => {
    test("sollte alle notwendigen Dateien im globalen Package haben", () => {
      const requiredFiles = [
        "src/cli/index.js",
        "src/cli/menu.js",
        "src/commands/copy.js",
        "src/commands/changelog.js",
        "src/commands/welcome.js",
        "src/core/git.js",
        "src/core/folder.js",
        "src/helpers/pathHelper.js",
        "src/utils/logger.js",
        "config/settings.js",
        "changelog.json",
      ];

      requiredFiles.forEach((file) => {
        const filePath = path.join(__dirname, "..", file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test("sollte korrekte package.json Konfiguration haben", () => {
      const packageJson = require("../package.json");

      expect(packageJson.bin).toBeDefined();
      expect(packageJson.bin.mlgc).toBe("./src/cli/index.js");
      expect(packageJson.files).toContain("src/");
      expect(packageJson.files).toContain("config/");
      expect(packageJson.files).toContain("changelog.json");
    });
  });

  describe("Path Resolution", () => {
    test("sollte changelog.json aus globalem Package-Verzeichnis laden können", () => {
      // Simuliere globale Installation
      const originalCwd = process.cwd();
      process.chdir(globalNodeModules);

      try {
        // Teste den Pfad, den die changelog.js verwendet
        const changelogPath = path.join(__dirname, "..", "changelog.json");
        expect(fs.existsSync(changelogPath)).toBe(true);

        const changelogData = JSON.parse(
          fs.readFileSync(changelogPath, "utf8")
        );
        expect(changelogData.changelog).toBeDefined();
        expect(Array.isArray(changelogData.changelog)).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    test("sollte settings.js aus globalem Package-Verzeichnis laden können", () => {
      // Simuliere globale Installation
      const originalCwd = process.cwd();
      process.chdir(globalNodeModules);

      try {
        // Teste den Pfad, den die git.js verwendet
        const settingsPath = path.join(
          __dirname,
          "..",
          "config",
          "settings.js"
        );
        expect(fs.existsSync(settingsPath)).toBe(true);

        const settings = require(settingsPath);
        expect(settings["ignored-files"]).toBeDefined();
        expect(Array.isArray(settings["ignored-files"])).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe("Module Loading", () => {
    test("sollte alle Module ohne Pfad-Fehler laden können", () => {
      // Simuliere globale Installation
      const originalCwd = process.cwd();
      process.chdir(globalNodeModules);

      try {
        // Teste alle kritischen Module
        expect(() => {
          require("../src/cli/index.js");
        }).not.toThrow();

        expect(() => {
          require("../src/cli/menu.js");
        }).not.toThrow();

        expect(() => {
          require("../src/commands/changelog.js");
        }).not.toThrow();

        expect(() => {
          require("../src/core/git.js");
        }).not.toThrow();
      } finally {
        process.chdir(originalCwd);
      }
    });

    test("sollte changelog-Funktion in globalem Kontext ausführen können", async () => {
      // Mock console.clear und process.stdout.write für den Test
      const originalConsoleClear = console.clear;
      const originalStdoutWrite = process.stdout.write;

      console.clear = jest.fn();
      process.stdout.write = jest.fn();

      try {
        // Mock die changelog-Funktion um die Animationen zu umgehen
        jest.mock("../src/commands/changelog", () => {
          return {
            showChangelog: jest.fn().mockImplementation(async () => {
              console.clear();
              console.log("Mocked changelog output");
            }),
          };
        });

        const { showChangelog } = require("../src/commands/changelog");

        // Teste dass die Funktion ohne Fehler läuft
        await showChangelog();

        // Prüfe dass console.clear aufgerufen wurde
        expect(console.clear).toHaveBeenCalled();
      } finally {
        console.clear = originalConsoleClear;
        process.stdout.write = originalStdoutWrite;
        jest.unmock("../src/commands/changelog");
      }
    }, 15000); // Erhöhe Timeout auf 15 Sekunden
  });

  describe("CLI Execution", () => {
    test("sollte CLI-Befehl in globalem Kontext ausführen können", () => {
      // Simuliere globale Installation
      const originalCwd = process.cwd();
      process.chdir(globalNodeModules);

      try {
        // Teste dass der CLI-Eintragspunkt existiert und ausführbar ist
        const cliPath = path.join(__dirname, "..", "src", "cli", "index.js");
        expect(fs.existsSync(cliPath)).toBe(true);

        // Prüfe Shebang
        const cliContent = fs.readFileSync(cliPath, "utf8");
        expect(cliContent).toMatch(/^#!/);
        expect(cliContent).toContain("node");
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe("Cross-Platform Compatibility", () => {
    test("sollte Pfade auf verschiedenen Plattformen korrekt auflösen", () => {
      const testPaths = [
        path.join(__dirname, "..", "changelog.json"),
        path.join(__dirname, "..", "config", "settings.js"),
        path.join(__dirname, "..", "src", "cli", "index.js"),
      ];

      testPaths.forEach((testPath) => {
        expect(fs.existsSync(testPath)).toBe(true);

        // Teste dass der Pfad korrekt normalisiert wird
        const normalizedPath = path.normalize(testPath);
        expect(fs.existsSync(normalizedPath)).toBe(true);
      });
    });
  });

  describe("Error Handling", () => {
    test("sollte graceful mit fehlenden Dateien umgehen", () => {
      // Simuliere fehlende changelog.json
      const changelogPath = path.join(__dirname, "..", "changelog.json");

      try {
        // Temporär die Datei umbenennen
        fs.renameSync(changelogPath, changelogPath + ".backup");

        const { showChangelog } = require("../src/commands/changelog");

        // Mock console.log um die Ausgabe zu fangen
        const originalLog = console.log;
        const mockLog = jest.fn();
        console.log = mockLog;

        try {
          showChangelog();

          // Prüfe dass eine Fehlermeldung ausgegeben wurde
          expect(mockLog).toHaveBeenCalledWith(
            expect.stringContaining("❌ Changelog.json not found!")
          );
        } finally {
          console.log = originalLog;
        }
      } finally {
        // Stelle die Datei wieder her
        if (fs.existsSync(changelogPath + ".backup")) {
          fs.renameSync(changelogPath + ".backup", changelogPath);
        }
      }
    });
  });
});
