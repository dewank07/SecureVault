export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
}

export class CryptoService {
  private static key: CryptoKey | null = null;

  static async deriveKey(password: string, salt?: Uint8Array): Promise<{ key: CryptoKey; salt: Uint8Array }> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const saltBuffer = salt || crypto.getRandomValues(new Uint8Array(16));
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );

    return { key, salt: saltBuffer };
  }

  static async setMasterKey(password: string, salt?: Uint8Array): Promise<Uint8Array> {
    const { key, salt: keySalt } = await this.deriveKey(password, salt);
    this.key = key;
    return keySalt;
  }

  static async encrypt(data: string): Promise<EncryptedData> {
    if (!this.key) throw new Error('Master key not set');

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key,
      dataBuffer
    );

    return {
      data: Array.from(new Uint8Array(encryptedBuffer))
        .map(b => b.toString(16).padStart(2, '0')).join(''),
      iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
      salt: ''
    };
  }

  static async decrypt(encryptedData: EncryptedData): Promise<string> {
    if (!this.key) throw new Error('Master key not set');

    const dataBuffer = new Uint8Array(
      encryptedData.data.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    const iv = new Uint8Array(
      encryptedData.iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.key,
      dataBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  static clearKey(): void {
    this.key = null;
  }

  static isUnlocked(): boolean {
    return this.key !== null;
  }
}