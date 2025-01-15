import { exists } from 'fs';
import { vi } from 'vitest'

// Mock the Azure Storage Blob SDK
const mockUploadBlockBlob = vi.fn().mockResolvedValue({});
const mockCreateIfNotExists = vi.fn().mockResolvedValue({});
const mockContainerClient = {
    uploadBlockBlob: mockUploadBlockBlob,
    createIfNotExists: mockCreateIfNotExists,
    exists: vi.fn().mockResolvedValue(true),
    listBlobsFlat: vi.fn().mockImplementation(({ prefix: path }) => {
        return {
            async *[Symbol.asyncIterator]() {
                yield* [];
            },
            next: vi.fn().mockResolvedValue({ done: true, value: undefined })
        };
    }),
};

const mockAzureStorage = {
    ContainerClient: vi.fn(() => mockContainerClient),
    StorageSharedKeyCredential: vi.fn(),
};


export { mockAzureStorage };