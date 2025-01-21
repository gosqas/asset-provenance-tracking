import { vi } from 'vitest'
import { getRandomValues } from 'crypto';
// import { encrypt } from '../../../src/functions/httpTrigger';
// import { makeDeviceKey } from '../utils';


async function init() {
    const { makeDeviceKey } = await import('../utils');
    const { encrypt } = await import('../../../src/functions/httpTrigger');
    // const salt = getRandomValues(new Uint8Array(16));
    const data = Buffer.alloc(1024, 'a');
    const deviceKey = await makeDeviceKey();
    const { salt, encryptedData } = await encrypt(deviceKey, data);
    // return { deviceKey, salt, encryptedData };
    return encryptedData;
}

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
    getBlockBlobClient: vi.fn().mockImplementation(() => ({
        exists: vi.fn().mockResolvedValue(true),
        // downloadToBuffer: vi.fn().mockResolvedValue(Buffer.alloc(1024, 'a')), // encrypted data
        downloadToBuffer: (() => {
            // init().then((data) => { return data });
            // return vi.fn().mockResolvedValue(init());
            return Buffer.alloc(1024, 'a');
        }),
        getProperties: vi.fn().mockResolvedValue({
            "metadata": {
                "gdtsalt": getRandomValues(new Uint8Array(16)),// bs58.encode(randomBytes(16)), //Buffer.from('dummy_salt_value', 'utf8')),
                "gdttimestamp": new Date().toISOString(),
                "gdthash": "dummy_hash_value",
                "gdtcontenttype": "deviceHeader",
            }
        }),
    })),
};

export const mockAzureStorage = {
    ContainerClient: vi.fn(() => mockContainerClient),
    StorageSharedKeyCredential: vi.fn(),
};
