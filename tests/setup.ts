import { vi } from 'vitest';

// Mock global fetch for SDK tests
global.fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.resetAllMocks();
});
