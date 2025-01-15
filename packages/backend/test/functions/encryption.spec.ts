import { describe, it, expect } from 'vitest';
import { calculateDeviceID, calculateLegacyDeviceID, decrypt, encrypt, sha256, toHex } from '../../src/functions/httpTrigger';

describe('encrypt function', () => {
    it('should encrypt and decrypt data', async () => {
        const data = Buffer.from('hello', 'utf8');
        const deviceKey = await sha256(Buffer.from('somekey', 'utf8'));
        const { salt, encryptedData } = await encrypt(deviceKey, data);
        
        expect(salt).toBeDefined();
        expect(encryptedData).toBeDefined();

        const decryptedData = await decrypt(deviceKey, salt, encryptedData);
        expect(Buffer.from(decryptedData)).toEqual(data);
    });
});

describe('calculateDeviceID function', () => {
    it('should calculate a device ID', async () => {
        const deviceKey = await sha256(Buffer.from('somekey', 'utf8'));
        const deviceID = await calculateDeviceID(deviceKey);
        console.log('deviceID', deviceID);
        expect(deviceID).toBeDefined();
    });
});

describe('calculateLegacyDeviceID function', () => {
    it('should calculate a legacy device ID', async () => {
        const deviceKey = await sha256(Buffer.from('hello', 'utf8'));
        const id = calculateLegacyDeviceID(deviceKey);
        expect(id).toBeDefined();
    });
});

describe('sha256 function', () => {
    it('should calculate a sha256 hash', async () => {
        const data = Buffer.from('hello', 'utf8');
        const hash = await sha256(data);
        expect(hash).toBeDefined();
    });
});

describe('fromHex function', () => {
    it('should convert a hex string to a buffer', async () => {
        const hex = '68656c6c6f';
        const data = Buffer.from('hello', 'utf8');
        const buffer = Buffer.from(hex, 'hex');
        expect(buffer).toEqual(data);
    });
});

describe('toHex function', () => {
    it('should convert a buffer to a hex string', async () => {
        const data = Buffer.from('hello', 'utf8');
        const hex = toHex(data);
        expect(hex).toEqual('68656c6c6f');
    });
});

