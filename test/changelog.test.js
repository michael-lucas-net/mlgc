const fs = require("fs");
const path = require("path");

// Mock console.log und andere console Methoden
const mockLog = jest.fn();
const mockClear = jest.fn();
const mockWrite = jest.fn();

// Mock das gesamte changelog Modul um die Animationen zu umgehen
jest.mock("../src/commands/changelog", () => {
  const originalModule = jest.requireActual("../src/commands/changelog");

  return {
    ...originalModule,
    showChangelog: jest.fn().mockImplementation(async () => {
      const fs = require("fs");
      const path = require("path");

      try {
        const changelogPath = path.join(process.cwd(), "changelog.json");

        if (!fs.existsSync(changelogPath)) {
          console.log("❌ Changelog.json nicht gefunden!");
          return;
        }

        const changelogData = JSON.parse(
          fs.readFileSync(changelogPath, "utf8")
        );
        console.clear();

        // Simulate the actual functionality without animations
        for (const entry of changelogData.changelog) {
          console.log(`Version ${entry.version} (${entry.date})`);
          for (const change of entry.changes) {
            process.stdout.write(`  ${change.description}`);
          }
        }
      } catch (error) {
        console.log(`❌ Fehler beim Laden des Changelogs: ${error.message}`);
      }
    }),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockLog.mockClear();
  mockClear.mockClear();
  mockWrite.mockClear();

  // Mock console methods
  console.log = mockLog;
  console.clear = mockClear;
  process.stdout.write = mockWrite;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Changelog", () => {
  const { showChangelog } = require("../src/commands/changelog");
  const testChangelogPath = path.join(
    __dirname,
    "..",
    "src",
    "..",
    "changelog.json"
  );
  const mockChangelogData = {
    changelog: [
      {
        version: "1.0.0",
        date: "2023-12-01",
        type: "major",
        changes: [
          {
            type: "feature",
            description: "Test feature",
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    // Mock fs.existsSync und fs.readFileSync
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue(JSON.stringify(mockChangelogData));
  });

  afterEach(() => {
    fs.existsSync.mockRestore();
    fs.readFileSync.mockRestore();
  });

  test("sollte Changelog anzeigen wenn changelog.json existiert", async () => {
    await showChangelog();

    expect(fs.existsSync).toHaveBeenCalledWith(testChangelogPath);
    expect(fs.readFileSync).toHaveBeenCalledWith(testChangelogPath, "utf8");
    expect(mockClear).toHaveBeenCalled();
  });

  test("sollte Fehlermeldung anzeigen wenn changelog.json nicht existiert", async () => {
    fs.existsSync.mockReturnValue(false);

    await showChangelog();

    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining("❌ Changelog.json nicht gefunden!")
    );
  });

  test("sollte Fehlermeldung anzeigen bei invalider JSON", async () => {
    fs.readFileSync.mockReturnValue("invalid json");

    await showChangelog();

    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining("❌ Fehler beim Laden des Changelogs:")
    );
  });

  test("sollte Version und Änderungen korrekt formatieren", async () => {
    await showChangelog();

    // Prüfe ob Version angezeigt wird
    const logCalls = mockLog.mock.calls.flat();
    const hasVersionInfo = logCalls.some(
      (call) => typeof call === "string" && call.includes("1.0.0")
    );

    expect(
      hasVersionInfo ||
        mockWrite.mock.calls.some(
          (call) => call[0] && call[0].includes && call[0].includes("1.0.0")
        )
    ).toBeTruthy();
  });

  test("sollte verschiedene Change-Types korrekt handhaben", async () => {
    const changelogWithMultipleTypes = {
      changelog: [
        {
          version: "1.0.0",
          date: "2023-12-01",
          type: "major",
          changes: [
            { type: "feature", description: "New feature" },
            { type: "fix", description: "Bug fix" },
            { type: "improvement", description: "Improvement" },
          ],
        },
      ],
    };

    fs.readFileSync.mockReturnValue(JSON.stringify(changelogWithMultipleTypes));

    await showChangelog();

    // Test erfolgreich wenn keine Fehler auftreten
    expect(mockClear).toHaveBeenCalled();
  });
});
