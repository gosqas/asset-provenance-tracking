import { vi, describe, it, expect, beforeEach } from 'vitest'
import { routeRegistrations } from './mocks/azureFunctions'
import { getProvenance, postProvenance, getAttachment, getAttachmentName } from '../../src/functions/httpTrigger'
import { makeEncodedDeviceKey } from './utils'
import { ContainerClient } from '@azure/storage-blob'
import { HttpRequest, InvocationContext } from '@azure/functions' // This should import from our mocks
import { mockAzureStorage } from './mocks/azureStorage';

vi.mock('../../src/functions/httpTrigger', async (importOriginal) => {
    const actual = await importOriginal() as Record<string, unknown>;
    return {
        ...actual,
        getDecryptedBlob: vi.fn().mockResolvedValue(new Blob(['test data'], { type: 'text/plain' }))
    };
});


describe('Test GDT API', () => {
    beforeEach(async () => {
        vi.clearAllMocks()
        await import('../../src/functions/httpTrigger')
    })
    
    it('should register getProvenance route', () => {
        const getProvenanceRoute = routeRegistrations.find(
            r => r.name === 'getProvenance'
        )

        expect(getProvenanceRoute).toBeDefined()
        expect(getProvenanceRoute).toEqual({
            method: 'get',
            name: 'getProvenance',
            options: {
                authLevel: 'anonymous',
                route: 'provenance/{deviceKey}',
                handler: expect.any(Function)
            }
        })
    });

    // TODO: test more routes

    it('should register all expected routes', () => {
        const expectedRoutes = [
            'getProvenance',
            'postProvenance',
            'upgradeProvenance',
            'getAttachment',
            'getAttachmentName',
            'getStatistics'
        ]

        expectedRoutes.forEach(routeName => {
            const route = routeRegistrations.find(r => r.name === routeName)
            expect(route, `Route ${routeName} should be registered`).toBeDefined()
        })
    });
    
});

describe('getProvenance', () => {
    // TODO: this test is not useful
    it('should return data', async () => {
        const request = {
            params: { deviceKey: await makeEncodedDeviceKey() }
        } as unknown as HttpRequest;

        const response = await getProvenance(request,  {} as InvocationContext);
        expect(response).toBeDefined();
    });
});

describe('postProvenance', () => {
    let request: HttpRequest;
    let context: InvocationContext;
    let containerClient: ContainerClient;

    beforeEach(async () => {
        vi.clearAllMocks()
        await import('../../src/functions/httpTrigger')

        // Create a new request that emulates the form data
        const mockRecord = {
            blobType: 'deviceInitializer',
            deviceName: "my device",
            description: "my description",
            tags: ['tag1', 'tag2'],
            children_key: '',
            hasParent: true,
            isReportingKey: true,
        };
        const formData = new FormData();
        formData.append("provenanceRecord", JSON.stringify(mockRecord));
        const attachments: File[] = [new File(['test data'], 'test.txt', { type: 'text/plain' })];
        for (const blob of attachments) {
            formData.append(blob.name, blob as Blob);
        }

        request = {
            params: { deviceKey: await makeEncodedDeviceKey() },
            formData: vi.fn().mockResolvedValue(formData)
        } as unknown as HttpRequest;

        context = { } as unknown as InvocationContext;

        // This isn't using the local storage emulator, so we need to mock the container client
        // TODO: maybe we can switch between them.
        // containerClient = new ContainerClient('http://localhost:10000/devstoreaccount1/gosqas');
        containerClient = new mockAzureStorage.ContainerClient() as unknown as ContainerClient;
    });

    it('should create record and upload attachments', async () => {
        const response = await postProvenance(request, context);

        expect(response.jsonBody).toBeDefined(); // jsonBody is an Azure function JSON seriealized body
        expect(containerClient.createIfNotExists).toHaveBeenCalled();
        expect(containerClient.uploadBlockBlob).toHaveBeenCalled();
    });

    it('should create group', async () => {
        const groupRecord = {
            blobType: 'deviceInitializer',
            deviceName: "my group",
            description: "my group description",
            tags: ['tag1', 'tag2'],
            children_key: '',
            children_name: '',
            hasParent: false,
            isReportingKey: false,
        };
        const groupFormData = new FormData();
        groupFormData.append("provenanceRecord", JSON.stringify(groupRecord));

        const groupRequest = {
            params: { deviceKey: await makeEncodedDeviceKey() },
            formData: vi.fn().mockResolvedValue(groupFormData)
        } as unknown as HttpRequest;
        
        await postProvenance(groupRequest, {} as InvocationContext);
    });

    it('should upload and download attachments', async () => {
        const blockBlobClient = containerClient.getBlockBlobClient('testBlob');
        const properties = await blockBlobClient.getProperties();

        // The deviceKey is stored in the properies only for testing
        // It is part of Azure Storage API
        const key = properties.deviceKey; 
        const attachmentRequest = {
            params: { deviceKey: key, attachmentID: 'attachmentID' }
        } as unknown as HttpRequest;

        const attachment = await getAttachment(attachmentRequest, context);
        expect(attachment).toBeDefined();
        expect(attachment.body).toBeInstanceOf(Uint8Array);
        expect(attachment.body?.length).toBe(1024);
        expect(attachment.headers).toBeDefined();
        
        expect(attachment.headers?.get('Access-Control-Allow-Headers')).toBe('Attachment-Name');
        expect(attachment.headers?.get('Content-Type')).toBe('deviceHeader');
    });

    it('should return 404 if provenanceRecord is not a string', async () => {
        request.formData = vi.fn().mockResolvedValue(new Map([
            ['provenanceRecord', 1234]
        ]));

        const response = await postProvenance(request, context);

        expect(response.status).toBe(404);
    });
});
