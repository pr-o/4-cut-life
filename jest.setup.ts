import "@testing-library/jest-dom";

// Radix UI components (Slider, etc.) use ResizeObserver which jsdom doesn't implement
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
