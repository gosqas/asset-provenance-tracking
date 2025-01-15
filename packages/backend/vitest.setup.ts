import { vi } from 'vitest'
import { mockAzureFunctions } from './test/functions/mocks/azure-functions'

// Global setup for all tests

// Mock Azure Functions for testing
vi.mock('@azure/functions', () => mockAzureFunctions)


// Suppress console output
// global.console = {
//   ...console,
//   log: vi.fn(),
//   error: vi.fn(),
//   warn: vi.fn(),
// }

