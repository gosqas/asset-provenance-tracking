import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notifySubscribers, sendNotification, subscribeNotification, unsubscribeNotification } from '../../src/functions/notification';
import { sendEmail } from '../../src/functions/sendEmail';
import { HttpRequest, InvocationContext } from '@azure/functions';
import { makeEncodedDeviceKey } from './utils';
import { getProvenance, postProvenance } from '../../src/functions/httpTrigger';

// Mock email client
vi.mock('../../src/functions/sendEmail', () => {
    return {
        sendEmail: vi.fn()
    };
});

describe('sendNotification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should call sendEmail with correct parameters', async () => {
        process.env['FROM_ADDRESS'] = 'test@example.com';
        const notification = {
            toAddress: "user.email",
            toName: "User Name",
            subject: "Create a subject line here",
            body: "Create a body here"
        }

        await sendNotification(notification);

        expect(sendEmail).toHaveBeenCalledWith(
            'test@example.com',
            notification.toAddress,
            notification.subject,
            notification.body,
            notification.toName
        );
    });

    it('should use empty string if FROM_ADDRESS is not defined', async () => {
        delete process.env['FROM_ADDRESS'];
        const notification = {
            toAddress: "user.email",
            toName: "User Name",
            subject: "Create a subject line here",
            body: "Create a body here"
        }

        await sendNotification(notification);

        expect(sendEmail).toHaveBeenCalledWith(
            '',
            notification.toAddress,
            notification.subject,
            notification.body,
            notification.toName
        );
    });
});


// Mock the existing Azure functions
vi.mock('../../src/functions/httpTrigger', () => ({
    getProvenance: vi.fn(),
    postProvenance: vi.fn()
}));


describe('subscribeNotification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should return 200 status and success message', async () => {
        // Create a new provenance record
        const testDeviceKey = await makeEncodedDeviceKey();
        const mockRecord = {
            jsonBody: {
                record: testDeviceKey,
                attachments: [{ blob: {} }]
            }
        };

        // Setup the mocks and their returned values
        (getProvenance as any).mockResolvedValue(mockRecord);
        (postProvenance as any).mockResolvedValue({});

        // Subscription request
        const request = {
            params: {
                deviceKey: testDeviceKey
            },
            body: {
                email: "user.email"
            }
        } as unknown as HttpRequest;

        const context = {} as InvocationContext;
        
        const response = await subscribeNotification(request, context);
        
        // Verify the mocks were called (the record was retrieved and updated)
        expect(getProvenance).toHaveBeenCalled();
        expect(postProvenance).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toBe("Subscribed successfully");
    });
});


describe('unsubscribeNotification', () => {
    it('should return 200 status and success message', async () => {
        const testDeviceKey = await makeEncodedDeviceKey();
        const mockRecord = {
            jsonBody: {
                record: testDeviceKey,
                attachments: [{ blob: {} }]
            }
        };

        // Setup the mocks and their returned values
        (getProvenance as any).mockResolvedValue(mockRecord);
        (postProvenance as any).mockResolvedValue({});

        // Unsubscription request
        const request = {
            params: {
                deviceKey: testDeviceKey
            },
            body: {
                email: "user.email"
            }
        } as unknown as HttpRequest;

        const context = {} as InvocationContext;

        const response = await unsubscribeNotification(request, context);

        // Verify the mocks were called (the record was retrieved and updated)
        expect(getProvenance).toHaveBeenCalled();
        expect(postProvenance).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toBe("Unsubscribed successfully");
    });
});


describe("notifySubscribers", () => {
    it("should return 200 status and success message", async () => {
        const testDeviceKey = await makeEncodedDeviceKey();
        const request = {
            params: { deviceKey: testDeviceKey },
            body: {
                record: testDeviceKey,
                attachments: [{ blob: {} }],
                subscribers: [ "user.email", "1234", "hello @!$##"]
            },
        } as unknown as HttpRequest;
        
        const context = {} as InvocationContext;

        // An event occurs, ie. the record is updated,
        // then the notification function is triggered;

        const response = await notifySubscribers(request, context);

        // Verify the mocks were called (the record was retrieved and updated)
        expect(getProvenance).toHaveBeenCalled();
        expect(postProvenance).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toBe("Notified successfully");
    });
});
