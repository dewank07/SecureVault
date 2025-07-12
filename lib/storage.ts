import localForage from 'localforage';
import { EncryptedData } from './crypto';

export interface BankCredential {
  id: string;
  type: 'upi_pin' | 'atm_pin' | 'net_banking' | 'mobile_banking' | 'transaction_password' | 'debit_card_pin' | 'credit_card_pin' | 'other';
  label: string; // e.g., "UPI PIN", "ATM PIN", "Net Banking Password"
  encryptedValue: EncryptedData;
  createdAt: Date;
  updatedAt: Date;
  notes?: string; // Optional notes for the credential
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string; // Last 4 digits or masked format
  accountType: 'savings' | 'current' | 'salary' | 'fd' | 'rd' | 'credit_card' | 'other';
  accountHolderName: string;
  credentials: BankCredential[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  notes?: string;
}

export interface VaultSettings {
  salt: string;
  theme: 'light' | 'dark';
  isFirstTime: boolean;
  defaultBanks: string[];
}

export const INDIAN_BANKS = [
  "State Bank of India (SBI)",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Yes Bank",
  "Punjab National Bank (PNB)",
  "Bank of Baroda",
  "Canara Bank",
  "Kotak Mahindra Bank",
  "Union Bank of India",
  "Indian Bank",
  "Bank of India",
  "Central Bank of India",
  "Indian Overseas Bank",
  "UCO Bank",
  "Other"
];

export const CREDENTIAL_TYPES = [
  { value: 'upi_pin', label: 'UPI PIN', description: 'PIN for UPI transactions' },
  { value: 'atm_pin', label: 'ATM PIN', description: 'PIN for ATM withdrawals' },
  { value: 'net_banking', label: 'Net Banking Password', description: 'Internet banking login password' },
  { value: 'mobile_banking', label: 'Mobile Banking PIN', description: 'Mobile app login PIN/password' },
  { value: 'transaction_password', label: 'Transaction Password', description: 'Password for online transactions' },
  { value: 'debit_card_pin', label: 'Debit Card PIN', description: 'PIN for debit card transactions' },
  { value: 'credit_card_pin', label: 'Credit Card PIN', description: 'PIN for credit card transactions' },
  { value: 'other', label: 'Other', description: 'Other banking credentials' }
];

class StorageService {
  private accountsStore = localForage.createInstance({
    name: 'SecureVault',
    storeName: 'bankAccounts'
  });

  private settingsStore = localForage.createInstance({
    name: 'SecureVault',
    storeName: 'settings'
  });

  // Bank Account Operations
  async saveBankAccount(account: BankAccount): Promise<void> {
    await this.accountsStore.setItem(account.id, account);
  }

  async getBankAccount(id: string): Promise<BankAccount | null> {
    return await this.accountsStore.getItem(id);
  }

  async getAllBankAccounts(): Promise<BankAccount[]> {
    const accounts: BankAccount[] = [];
    await this.accountsStore.iterate((account: BankAccount) => {
      accounts.push(account);
    });
    return accounts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async deleteBankAccount(id: string): Promise<void> {
    await this.accountsStore.removeItem(id);
  }

  // Credential Operations within Bank Account
  async addCredentialToAccount(accountId: string, credential: BankCredential): Promise<void> {
    const account = await this.getBankAccount(accountId);
    if (!account) throw new Error('Bank account not found');
    
    account.credentials.push(credential);
    account.updatedAt = new Date();
    await this.saveBankAccount(account);
  }

  async updateCredentialInAccount(accountId: string, credential: BankCredential): Promise<void> {
    const account = await this.getBankAccount(accountId);
    if (!account) throw new Error('Bank account not found');
    
    const credentialIndex = account.credentials.findIndex(c => c.id === credential.id);
    if (credentialIndex === -1) throw new Error('Credential not found');
    
    account.credentials[credentialIndex] = credential;
    account.updatedAt = new Date();
    await this.saveBankAccount(account);
  }

  async deleteCredentialFromAccount(accountId: string, credentialId: string): Promise<void> {
    const account = await this.getBankAccount(accountId);
    if (!account) throw new Error('Bank account not found');
    
    account.credentials = account.credentials.filter(c => c.id !== credentialId);
    account.updatedAt = new Date();
    await this.saveBankAccount(account);
  }

  // Settings Operations
  async saveSettings(settings: VaultSettings): Promise<void> {
    await this.settingsStore.setItem('settings', settings);
  }

  async getSettings(): Promise<VaultSettings | null> {
    return await this.settingsStore.getItem('settings');
  }

  // Search and Filter Operations
  async searchAccounts(query: string): Promise<BankAccount[]> {
    const accounts = await this.getAllBankAccounts();
    const lowerQuery = query.toLowerCase();
    
    return accounts.filter(account => 
      account.bankName.toLowerCase().includes(lowerQuery) ||
      account.accountHolderName.toLowerCase().includes(lowerQuery) ||
      account.accountNumber.includes(query) ||
      account.credentials.some(cred => cred.label.toLowerCase().includes(lowerQuery))
    );
  }

  async getAccountsByBank(bankName: string): Promise<BankAccount[]> {
    const accounts = await this.getAllBankAccounts();
    return accounts.filter(account => account.bankName === bankName);
  }

  // Statistics
  async getVaultStats(): Promise<{
    totalAccounts: number;
    totalCredentials: number;
    bankDistribution: Record<string, number>;
    credentialTypeDistribution: Record<string, number>;
  }> {
    const accounts = await this.getAllBankAccounts();
    const bankDistribution: Record<string, number> = {};
    const credentialTypeDistribution: Record<string, number> = {};
    let totalCredentials = 0;

    accounts.forEach(account => {
      bankDistribution[account.bankName] = (bankDistribution[account.bankName] || 0) + 1;
      
      account.credentials.forEach(credential => {
        credentialTypeDistribution[credential.type] = (credentialTypeDistribution[credential.type] || 0) + 1;
        totalCredentials++;
      });
    });

    return {
      totalAccounts: accounts.length,
      totalCredentials,
      bankDistribution,
      credentialTypeDistribution
    };
  }

  async clearAllData(): Promise<void> {
    await this.accountsStore.clear();
    await this.settingsStore.clear();
  }
}

export const storageService = new StorageService();