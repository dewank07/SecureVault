import { create } from 'zustand';
import { BankAccount, BankCredential } from './storage';

interface VaultState {
  isUnlocked: boolean;
  bankAccounts: BankAccount[];
  theme: 'light' | 'dark';
  isFirstTime: boolean;
  selectedBankFilter: string;
  searchQuery: string;
  
  // Actions
  setUnlocked: (unlocked: boolean) => void;
  setBankAccounts: (accounts: BankAccount[]) => void;
  addBankAccount: (account: BankAccount) => void;
  updateBankAccount: (account: BankAccount) => void;
  removeBankAccount: (id: string) => void;
  
  // Credential actions within accounts
  addCredentialToAccount: (accountId: string, credential: BankCredential) => void;
  updateCredentialInAccount: (accountId: string, credential: BankCredential) => void;
  removeCredentialFromAccount: (accountId: string, credentialId: string) => void;
  
  // UI state
  setTheme: (theme: 'light' | 'dark') => void;
  setFirstTime: (isFirstTime: boolean) => void;
  setSelectedBankFilter: (bank: string) => void;
  setSearchQuery: (query: string) => void;
  
  // Computed getters
  getFilteredAccounts: () => BankAccount[];
  getAccountsByBank: (bankName: string) => BankAccount[];
  getTotalCredentials: () => number;
  
  reset: () => void;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  isUnlocked: false,
  bankAccounts: [],
  theme: 'light',
  isFirstTime: true,
  selectedBankFilter: 'all',
  searchQuery: '',

  setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
  
  setBankAccounts: (accounts) => set({ bankAccounts: accounts }),
  
  addBankAccount: (account) => set((state) => ({ 
    bankAccounts: [account, ...state.bankAccounts] 
  })),
  
  updateBankAccount: (account) => set((state) => ({
    bankAccounts: state.bankAccounts.map((acc) => 
      acc.id === account.id ? account : acc
    )
  })),
  
  removeBankAccount: (id) => set((state) => ({
    bankAccounts: state.bankAccounts.filter((acc) => acc.id !== id)
  })),

  addCredentialToAccount: (accountId, credential) => set((state) => ({
    bankAccounts: state.bankAccounts.map((account) =>
      account.id === accountId
        ? { 
            ...account, 
            credentials: [...account.credentials, credential],
            updatedAt: new Date()
          }
        : account
    )
  })),

  updateCredentialInAccount: (accountId, credential) => set((state) => ({
    bankAccounts: state.bankAccounts.map((account) =>
      account.id === accountId
        ? {
            ...account,
            credentials: account.credentials.map((cred) =>
              cred.id === credential.id ? credential : cred
            ),
            updatedAt: new Date()
          }
        : account
    )
  })),

  removeCredentialFromAccount: (accountId, credentialId) => set((state) => ({
    bankAccounts: state.bankAccounts.map((account) =>
      account.id === accountId
        ? {
            ...account,
            credentials: account.credentials.filter((cred) => cred.id !== credentialId),
            updatedAt: new Date()
          }
        : account
    )
  })),

  setTheme: (theme) => set({ theme }),
  setFirstTime: (isFirstTime) => set({ isFirstTime }),
  setSelectedBankFilter: (bank) => set({ selectedBankFilter: bank }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredAccounts: () => {
    const { bankAccounts, selectedBankFilter, searchQuery } = get();
    let filtered = bankAccounts;

    if (selectedBankFilter !== 'all') {
      filtered = filtered.filter(account => account.bankName === selectedBankFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(account =>
        account.bankName.toLowerCase().includes(query) ||
        account.accountHolderName.toLowerCase().includes(query) ||
        account.accountNumber.includes(searchQuery) ||
        account.credentials.some(cred => cred.label.toLowerCase().includes(query))
      );
    }

    return filtered;
  },

  getAccountsByBank: (bankName) => {
    const { bankAccounts } = get();
    return bankAccounts.filter(account => account.bankName === bankName);
  },

  getTotalCredentials: () => {
    const { bankAccounts } = get();
    return bankAccounts.reduce((total, account) => total + account.credentials.length, 0);
  },

  reset: () => set({
    isUnlocked: false,
    bankAccounts: [],
    theme: 'light',
    isFirstTime: true,
    selectedBankFilter: 'all',
    searchQuery: ''
  })
}));