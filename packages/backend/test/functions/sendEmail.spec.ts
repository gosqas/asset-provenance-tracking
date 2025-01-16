import { describe, it, expect, vi } from 'vitest';
import { sendEmail } from '../../src/functions/sendEmail';

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

describe('sendEmail', () => {
    it('should send an email successfully', async () => {
        const from_address = 'test@example.com';
        const to_address = 'recipient@example.com';
        const subject = 'Test Subject';
        const body = 'This is a test email.';
        const displayName = 'Test User';

        const result = await sendEmail(from_address, to_address, subject, body, displayName);
        console.log(result);
        expect(result.status).toBe('Succeeded');
    });
});
