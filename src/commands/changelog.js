const chalk = require("chalk");
const boxen = require("boxen");
const fs = require("fs");
const path = require("path");

// Animation-Konstanten für einfache Anpassung
const ANIMATION_SPEED = {
  HEADER_TYPEWRITER: 30, // Geschwindigkeit für Header-Text (ms pro Zeichen)
  FOOTER_TYPEWRITER: 25, // Geschwindigkeit für Footer-Text (ms pro Zeichen)
  CHANGE_TYPEWRITER: 8, // Geschwindigkeit für Änderungen (ms pro Zeichen)
  HEADER_PAUSE: 200, // Pause nach Header (ms)
  VERSION_PAUSE: 100, // Pause zwischen Versionen (ms)
  VERSION_BOX_PAUSE: 80, // Pause nach Version-Box (ms)
  CHANGE_PAUSE: 50, // Pause zwischen Änderungen (ms)
  SECTION_PAUSE: 100, // Pause zwischen Sections (ms)
  FOOTER_PAUSE: 200, // Pause vor Footer (ms)
  ASCII_FRAME_SPEED: 100, // ASCII-Animation Geschwindigkeit (ms)
  FINAL_PAUSE: 500, // Finale Pause (ms)
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getChangeIcon(changeType) {
  const icons = {
    feature: "✨",
    fix: "🔧",
    improvement: "⚡",
    breaking: "💥",
    docs: "📝",
    style: "💄",
    refactor: "♻️",
    test: "✅",
    chore: "🔧",
  };
  return icons[changeType] || "📌";
}

function getVersionBadge(type) {
  const badges = {
    major: chalk.bgRed.white.bold(` MAJOR `),
    minor: chalk.bgYellow.black.bold(` MINOR `),
    patch: chalk.bgGreen.white.bold(` PATCH `),
  };
  return badges[type] || chalk.bgBlue.white.bold(` RELEASE `);
}

async function animateText(text, delay = ANIMATION_SPEED.CHANGE_TYPEWRITER) {
  for (let i = 0; i <= text.length; i++) {
    process.stdout.write("\r" + text.substring(0, i));
    await sleep(delay);
  }
  console.log();
}

async function showChangelog() {
  try {
    // Lade Changelog-Daten - verwende __dirname um das Package-Verzeichnis zu finden
    const changelogPath = path.join(__dirname, "..", "..", "changelog.json");

    if (!fs.existsSync(changelogPath)) {
      console.log(chalk.red("❌ Changelog.json nicht gefunden!"));
      return;
    }

    const changelogData = JSON.parse(fs.readFileSync(changelogPath, "utf8"));

    // Animierter Header
    console.clear();
    console.log();

    const header = chalk.cyan.bold("🦙 MLGC CHANGELOG 🦙");
    await animateText(header, ANIMATION_SPEED.HEADER_TYPEWRITER);

    console.log(chalk.gray("━".repeat(50)));
    await sleep(ANIMATION_SPEED.HEADER_PAUSE);

    // Zeige Changelog-Einträge mit Animation
    for (const entry of changelogData.changelog) {
      await sleep(ANIMATION_SPEED.VERSION_PAUSE);

      // Version Header mit Animation
      const versionLine = `${getVersionBadge(entry.type)} ${chalk.bold.white(entry.version)} ${chalk.gray(`(${entry.date})`)}`;

      const versionBox = boxen(versionLine, {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        borderStyle: "round",
        borderColor:
          entry.type === "major"
            ? "red"
            : entry.type === "minor"
              ? "yellow"
              : "green",
        margin: { top: 1, bottom: 0 },
      });

      console.log(versionBox);
      await sleep(ANIMATION_SPEED.VERSION_BOX_PAUSE);

      // Änderungen mit Animation
      for (const change of entry.changes) {
        await sleep(ANIMATION_SPEED.CHANGE_PAUSE);
        const icon = getChangeIcon(change.type);
        const changeText = `  ${icon} ${change.description}`;

        // Typewriter-Effekt für jede Änderung
        process.stdout.write("  ");
        for (let i = 0; i < changeText.length - 2; i++) {
          process.stdout.write(changeText[2 + i]);
          await sleep(ANIMATION_SPEED.CHANGE_TYPEWRITER);
        }
        console.log();
      }

      await sleep(ANIMATION_SPEED.SECTION_PAUSE);
    }

    // Animierter Footer
    await sleep(ANIMATION_SPEED.FOOTER_PAUSE);
    console.log();
    console.log(chalk.gray("━".repeat(50)));

    const footerText = chalk.cyan("✨ Danke für die Nutzung von MLGC! ✨");
    await animateText(footerText, ANIMATION_SPEED.FOOTER_TYPEWRITER);

    console.log();

    // Coole ASCII-Art Animation
    const frames = [
      "( ◔ ͜ʖ ◔ )",
      "( ◕ ͜ʖ ◕ )",
      "( ⊙ ͜ʖ ⊙ )",
      "( ◕ ͜ʖ ◕ )",
      "( ◔ ͜ʖ ◔ )",
    ];

    for (let i = 0; i < 6; i++) {
      process.stdout.write("\r" + chalk.yellow(frames[i % frames.length]));
      await sleep(ANIMATION_SPEED.ASCII_FRAME_SPEED);
    }
    console.log("\r" + chalk.yellow("( ◕ ͜ʖ ◕ )"));

    await sleep(ANIMATION_SPEED.FINAL_PAUSE);
  } catch (error) {
    console.log(
      chalk.red(`❌ Fehler beim Laden des Changelogs: ${error.message}`)
    );
  }
}

module.exports = { showChangelog };
