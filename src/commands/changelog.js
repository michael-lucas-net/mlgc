const chalk = require("chalk");
const boxen = require("boxen");
const fs = require("fs");
const path = require("path");

const ANIMATION_SPEED = {
  HEADER_TYPEWRITER: 30,
  FOOTER_TYPEWRITER: 25,
  CHANGE_TYPEWRITER: 8,
  HEADER_PAUSE: 200,
  VERSION_PAUSE: 100,
  VERSION_BOX_PAUSE: 80,
  CHANGE_PAUSE: 50,
  SECTION_PAUSE: 100,
  FOOTER_PAUSE: 200,
  ASCII_FRAME_SPEED: 100,
  FINAL_PAUSE: 500,
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
  for (let i = 0; i < text.length; i++) {
    process.stdout.write("\r" + text.substring(0, i + 1));
    await sleep(delay);
  }
  process.stdout.write("\r" + text);
  console.log();
}

async function showChangelog() {
  try {
    const changelogPath = path.join(__dirname, "..", "..", "changelog.json");

    if (!fs.existsSync(changelogPath)) {
      console.log(chalk.red("❌ Changelog.json not found!"));
      return;
    }

    const changelogData = JSON.parse(fs.readFileSync(changelogPath, "utf8"));

    // Animated header
    console.clear();
    console.log();

    const header = chalk.cyan.bold("🦙 MLGC CHANGELOG 🦙");
    await animateText(header, ANIMATION_SPEED.HEADER_TYPEWRITER);

    console.log(chalk.gray("━".repeat(50)));
    await sleep(ANIMATION_SPEED.HEADER_PAUSE);

    // Show changelog entries with animation
    for (const entry of changelogData.changelog) {
      await sleep(ANIMATION_SPEED.VERSION_PAUSE);

      // Version header with animation
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

      // Changes with animation
      for (const change of entry.changes) {
        await sleep(ANIMATION_SPEED.CHANGE_PAUSE);
        const icon = getChangeIcon(change.type);
        const changeText = `  ${icon} ${change.description}`;

        // Typewriter effect for each change
        process.stdout.write("  ");
        for (let i = 0; i < changeText.length - 2; i++) {
          process.stdout.write(changeText[2 + i]);
          await sleep(ANIMATION_SPEED.CHANGE_TYPEWRITER);
        }
        console.log();
      }

      await sleep(ANIMATION_SPEED.SECTION_PAUSE);
    }

    // Animated footer
    await sleep(ANIMATION_SPEED.FOOTER_PAUSE);
    console.log();
    console.log(chalk.gray("━".repeat(50)));

    const footerText = chalk.cyan("✨ Thanks for using MLGC! ✨");
    await animateText(footerText, ANIMATION_SPEED.FOOTER_TYPEWRITER);

    console.log();

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
    console.log(chalk.red(`❌ Error loading changelog: ${error.message}`));
  }
}

module.exports = { showChangelog };
