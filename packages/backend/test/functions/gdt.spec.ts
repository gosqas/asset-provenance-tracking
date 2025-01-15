import { vi, describe, it, expect, beforeEach } from 'vitest'
import { routeRegistrations } from './mocks/azureFunctions'
import { getProvenance, postProvenance } from '../../src/functions/httpTrigger'
import { HttpRequest, InvocationContext } from '@azure/functions'
import { makeEncodedDeviceKey } from './utils'
import { ContainerClient } from '@azure/storage-blob'
import * as JSON5 from 'json5';

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

    describe('postProvenance', () => {
        let request: HttpRequest;
        let context: InvocationContext;
        let containerClient: ContainerClient;

        beforeEach(async () => {
            // Create a new request that emulates the form data
            request = {
                params: { deviceKey: await makeEncodedDeviceKey() },
                formData: vi.fn().mockResolvedValue(new Map([
                    ['provenanceRecord', JSON5.stringify({ test: 'record' })],
                    ['attachment1', new Blob(['test data'], { type: 'text/plain' })]
                ]))
            } as unknown as HttpRequest;

            context = {
                log: vi.fn(),
            } as unknown as InvocationContext;

            // This isn't using the local storage emulator, so we need to mock the container client
            // TODO: maybe we can switch between them.
            containerClient = new ContainerClient('http://localhost:10000/devstoreaccount1/gosqas');
        });

        it('should upload provenance record and attachments', async () => {
            const response = await postProvenance(request, context);

            expect(response.jsonBody).toBeDefined();
            expect(containerClient.createIfNotExists).toHaveBeenCalled();
            expect(containerClient.uploadBlockBlob).toHaveBeenCalled();
        });

        it('should return 404 if provenanceRecord is not a string', async () => {
            request.formData = vi.fn().mockResolvedValue(new Map([
                ['provenanceRecord', new Blob(['not a string'], { type: 'application/json' })]
            ]));

            const response = await postProvenance(request, context);

            expect(response.status).toBe(404);
        });
    });

    describe('getProvenance', () => {
        it('should return data', async () => {
            const request = {
                params: { deviceKey: await makeEncodedDeviceKey() }
            } as unknown as HttpRequest;
            const context = {} as InvocationContext;

            const response = await getProvenance(request, context);

            console.log(response);
            expect(response )
            // expect(response.status).toBe(200);
        });
    });
})
