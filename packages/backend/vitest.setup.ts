import { vi } from 'vitest'
import { mockAzureFunctions } from './test/functions/mocks/azureFunctions'
import { mockAzureStorage } from './test/functions/mocks/azureStorage'

// Global setup for all tests

// Mock Azure Functions for testing
vi.mock('@azure/functions', () => mockAzureFunctions)
vi.mock('@azure/storage-blob', async () => mockAzureStorage);

// Suppress console output
// global.console = {
//   ...console,
//   log: vi.fn(),
//   error: vi.fn(),
//   warn: vi.fn(),
// }

