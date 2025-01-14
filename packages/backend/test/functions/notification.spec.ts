import { describe, it, expect, vi } from 'vitest';
import { sendNotification, subscribeNotification, unsubscribeNotification } from '../../src/functions/notification';
import { sendEmail } from '../../src/functions/sendEmail';
import { HttpRequest, InvocationContext } from '@azure/functions';

vi.mock('../../src/functions/sendEmail', () => {
    return {
        sendEmail: vi.fn()
    };
});

describe('sendNotification', () => {
    it('should call sendEmail with correct parameters', async () => {
        process.env['FROM_ADDRESS'] = 'test@example.com';
        const to_address = "user.email";
        const subject = "Create a subject line here";
        const body = "Create a body here";
        const displayName = "User Name";

        await sendNotification();

        expect(sendEmail).toHaveBeenCalledWith(
            'test@example.com',
            to_address,
            subject,
            body,
            displayName
        );
    });

    it('should use empty string if FROM_ADDRESS is not defined', async () => {
        delete process.env['FROM_ADDRESS'];
        const to_address = "user.email";
        const subject = "Create a subject line here";
        const body = "Create a body here";
        const displayName = "User Name";

        await sendNotification();

        expect(sendEmail).toHaveBeenCalledWith(
            '',
            to_address,
            subject,
            body,
            displayName
        );
    });
});

describe('subscribeNotification', () => {
    it('should return 200 status and success message', async () => {
        const request = {} as HttpRequest;
        const context = {} as InvocationContext;

        const response = await subscribeNotification(request, context);

        expect(response.status).toBe(200);
        expect(response.body).toBe("Subscribed successfully");
    });
});

describe('unsubscribeNotification', () => {
    it('should return 200 status and success message', async () => {
        const request = {} as HttpRequest;
        const context = {} as InvocationContext;

        const response = await unsubscribeNotification(request, context);

        expect(response.status).toBe(200);
        expect(response.body).toBe("Unsubscribed successfully");
    });
});
