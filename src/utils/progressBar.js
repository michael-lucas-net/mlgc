const cliProgress = require("cli-progress");
const chalk = require("chalk");

class ProgressBar {
  constructor(total, options = {}) {
    this.total = total;
    this.current = 0;
    this.startTime = Date.now();
    this.currentFile = "";

    const defaultOptions = {
      format:
        chalk.cyan("{bar}") +
        " | {percentage}% | {value}/{total} files | {duration}s | ETA: {eta}s | {filename}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
      clearOnComplete: false,
      stopOnComplete: true,
    };

    this.bar = new cliProgress.SingleBar(
      { ...defaultOptions, ...options },
      cliProgress.Presets.shades_classic
    );

    console.log();
    this.bar.start(total, 0, {
      filename: "Initializing...",
    });
  }

  update(current, filename = "") {
    this.current = current;
    const now = Date.now();
    const elapsed = (now - this.startTime) / 1000;

    // Calculate average time per file for ETA
    if (current > 0) {
      const avgTimePerFile = elapsed / current;
      const remaining = this.total - current;
      const eta = Math.ceil(avgTimePerFile * remaining);
      this.bar.update(current, {
        filename: filename || this.currentFile,
        duration: Math.round(elapsed),
        eta: eta,
      });
    } else {
      this.bar.update(current, {
        filename: filename || this.currentFile,
        duration: Math.round(elapsed),
        eta: "?",
      });
    }

    this.currentFile = filename;
  }

  increment(filename = "") {
    this.update(this.current + 1, filename);
  }

  stop() {
    this.bar.stop();
  }

  getElapsedTime() {
    return (Date.now() - this.startTime) / 1000;
  }
}

module.exports = { ProgressBar };

