import base58 from "bs58";

// Server-side copy of client side encryption functions.
// Only use for testing.

export async function makeDeviceKey(): Promise<Uint8Array> {
    const key = await crypto.subtle.generateKey({
        name: "AES-CBC",
        length: 128
    }, true, ['encrypt', 'decrypt']);
    const buffer = await crypto.subtle.exportKey("raw", key);
    return new Uint8Array(buffer).slice();
}

function encodeDeviceKey(key: Uint8Array): string {
    return base58.encode(key);
}

export async function makeEncodedDeviceKey(): Promise<string> {
    return encodeDeviceKey(await makeDeviceKey());
}

export function validateKey(key: string): boolean {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return typeof key === 'string' && key.length === 22 && alphanumericRegex.test(key);
}
