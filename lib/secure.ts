
const KEY = 'komida-v1';

// XOR Cipher
function xorString(text: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
    }
    return result;
}

export function encryptData(data: any): string {
    try {
        const json = JSON.stringify(data);
        const xor = xorString(json);
        // Base64Url Encode
        return btoa(xor)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    } catch (e) {
        console.error('Encryption failed', e);
        return '';
    }
}

export function decryptData(enc: string): any {
    if (!enc) return null;

    // Legacy support (though frontend usually doesn't decrypt legacy)
    if (enc.startsWith('http') || enc.startsWith('/')) {
        return { link: enc, source: '' };
    }

    try {
        // Base64Url Decode
        let base64 = enc.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        const xor = atob(base64);
        const json = xorString(xor);
        return JSON.parse(json);
    } catch (e) {
        console.error('Decryption failed', e);
        return null;
    }
}
