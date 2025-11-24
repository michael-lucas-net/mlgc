// Global mocks for ES modules that Jest cannot handle
// These mocks are used as fallbacks when tests don't provide their own mocks
jest.mock("chalk", () => {
  const mockChalk = (text) => text;
  const mockBold = (text) => text;
  
  mockChalk.green = mockChalk;
  mockChalk.cyan = mockChalk;
  mockChalk.yellow = mockChalk;
  mockChalk.red = mockChalk;
  
  // Support for chained calls like chalk.yellow.bold
  mockChalk.green.bold = mockBold;
  mockChalk.cyan.bold = mockBold;
  mockChalk.yellow.bold = mockBold;
  mockChalk.red.bold = mockBold;
  
  return mockChalk;
});

jest.mock("boxen", () => {
  return jest.fn((text, options) => text);
});

