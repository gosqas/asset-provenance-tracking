import { vi } from 'vitest'
import { ContainerClient } from '@azure/storage-blob';
import { encodeDeviceKey } from '../utils';

// Copied from backend (not great!)
async function sha256(data: BufferSource) {
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(buffer);
}

function toHex(data: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>): string {
    return Buffer.from(data).toString("hex");
}

export async function mockKeySaltData(data: Uint8Array) {
    const { makeDeviceKey } = await import('../utils');
    const { encrypt } = await import('../../../src/functions/httpTrigger');
    const deviceKey = await makeDeviceKey();
    const { salt, encryptedData } = await encrypt(deviceKey, data);
    return { deviceKey, salt, encryptedData };
}

let encryptedData: Uint8Array<ArrayBuffer>;

async function mockProperties() {
    const unencryptedData = Buffer.alloc(1024, 'a');
    const s = await mockKeySaltData(unencryptedData);
    const dk =  encodeDeviceKey(s.deviceKey);
    const hash = toHex(await sha256(unencryptedData));
    encryptedData = s.encryptedData; // Store the encrypted data in the global scope
    return {
        "deviceKey": dk, // For testing only
        "metadata": {
                "gdtsalt": s.salt,
                "gdttimestamp": new Date().toISOString(),
                "gdthash": hash,
                "gdtcontenttype": "deviceHeader",
            }
        }
}

// Run mockProperties to initialize encryptedData
const props = mockProperties();

// Mock the Azure Storage Blob SDK
const mockUploadBlockBlob = vi.fn().mockResolvedValue({});
const mockCreateIfNotExists = vi.fn().mockResolvedValue({});
const mockContainerClient: Partial<ContainerClient> = {
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
        getProperties: vi.fn().mockResolvedValue(props),
        downloadToBuffer: vi.fn().mockResolvedValue(encryptedData), // encrypted data
        name: 'testBlockBlobClient',
    })),
};


export const mockAzureStorage = {
    ContainerClient: vi.fn(() => mockContainerClient),
    StorageSharedKeyCredential: vi.fn(),
};
