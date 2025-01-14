import { describe, it, expect, vi } from 'vitest';
import { sendEmail } from "./sendEmail";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

vi.mock('@azure/communication-email', () => {
    const mockBeginSend = vi.fn().mockResolvedValue({
        getOperationState: vi.fn().mockReturnValue({ isStarted: true }),
        isDone: vi.fn().mockReturnValue(true),
        poll: vi.fn(),
        getResult: vi.fn().mockReturnValue({ status: 'Succeeded', id: 'test-id' })
    });

    return {
        EmailClient: vi.fn().mockImplementation(() => {
            return {
                beginSend: mockBeginSend
            };
        }),
        KnownEmailSendStatus: {
            Succeeded: 'Succeeded'
        }
    };
});

export async function sendNotification() {
    const from_address = process.env['FROM_ADDRESS'] || '';
    const to_address = "user.email"
    const subject = "Create a subject line here";
    const body = "Create a body here";
    const displayName = "User Name";

    await sendEmail(from_address, to_address, subject, body, displayName);
}

export async function subscribeNotification(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    return {
        status: 200,
        body: "Subscribed successfully"
    };
}

export async function unsubscribeNotification(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    return {
        status: 200,
        body: "Unsubscribed successfully"
    };
}


app.get("subscribeNotification", {
    authLevel: 'anonymous',
    route: 'notification/subscribe',
    handler: subscribeNotification
})

app.post("unsubscribeNotification", {
    authLevel: 'anonymous',
    route: 'notification/unsubscribe',
    handler: unsubscribeNotification
})
