"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BankAccountCard } from "@/components/BankAccountCard";
import { BankAccountForm } from "@/components/BankAccountForm";
import { CredentialForm } from "@/components/CredentialForm";
import { ExportDialog } from "@/components/ExportDialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Lock, Download, Sun, Moon, Building2, Shield, Filter, BarChart3 } from "lucide-react";
import { BankAccount, BankCredential, INDIAN_BANKS } from "@/lib/storage";
import { storageService } from "@/lib/storage";
import { useVaultStore } from "@/lib/store";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";

interface VaultDashboardProps {
  onLock: () => void;
}

export function VaultDashboard({ onLock }: VaultDashboardProps) {
  const {
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    removeBankAccount,
    addCredentialToAccount,
    updateCredentialInAccount,
    removeCredentialFromAccount,
    selectedBankFilter,
    searchQuery,
    setSelectedBankFilter,
    setSearchQuery,
    getFilteredAccounts,
    getTotalCredentials,
  } = useVaultStore();

  const { theme, setTheme } = useTheme();
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isCredentialFormOpen, setIsCredentialFormOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | undefined>();
  const [editingCredential, setEditingCredential] = useState<
    { accountId: string; credential?: BankCredential } | undefined
  >();

  const filteredAccounts = getFilteredAccounts();
  const totalCredentials = getTotalCredentials();

  // Get unique banks from accounts for filter
  const availableBanks = Array.from(new Set(bankAccounts.map((account) => account.bankName))).sort();

  const handleSaveAccount = async (account: BankAccount) => {
    try {
      await storageService.saveBankAccount(account);
      if (editingAccount) {
        updateBankAccount(account);
      } else {
        addBankAccount(account);
      }
      setEditingAccount(undefined);
    } catch (error) {
      toast.error("Failed to save account");
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await storageService.deleteBankAccount(id);
      removeBankAccount(id);
      toast.success("Account deleted");
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setIsAccountFormOpen(true);
  };

  const handleNewAccount = () => {
    setEditingAccount(undefined);
    setIsAccountFormOpen(true);
  };

  const handleAddCredential = (accountId: string) => {
    setEditingCredential({ accountId });
    setIsCredentialFormOpen(true);
  };

  const handleEditCredential = (accountId: string, credentialId: string) => {
    const account = bankAccounts.find((acc) => acc.id === accountId);
    const credential = account?.credentials.find((cred) => cred.id === credentialId);
    if (credential) {
      setEditingCredential({ accountId, credential });
      setIsCredentialFormOpen(true);
    }
  };

  const handleSaveCredential = async (credential: BankCredential) => {
    if (!editingCredential) return;

    try {
      if (editingCredential.credential) {
        await storageService.updateCredentialInAccount(editingCredential.accountId, credential);
        updateCredentialInAccount(editingCredential.accountId, credential);
      } else {
        await storageService.addCredentialToAccount(editingCredential.accountId, credential);
        addCredentialToAccount(editingCredential.accountId, credential);
      }
      setEditingCredential(undefined);
    } catch (error) {
      toast.error("Failed to save credential");
    }
  };

  const handleDeleteCredential = async (accountId: string, credentialId: string) => {
    try {
      await storageService.deleteCredentialFromAccount(accountId, credentialId);
      removeCredentialFromAccount(accountId, credentialId);
      toast.success("Credential deleted");
    } catch (error) {
      toast.error("Failed to delete credential");
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      {/* Header */}
      <header className='sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50'>
        <div className='container-responsive py-3 sm:py-4'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0'>
            <div className='flex items-center gap-3 min-w-0 flex-1'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0'>
                <Shield className='w-4 h-4 sm:w-6 sm:h-6 text-primary' />
              </div>
              <div className='min-w-0 flex-1'>
                <h1 className='text-lg sm:text-xl font-bold truncate'>SecureVault Banking</h1>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {bankAccounts.length} accounts • {totalCredentials} credentials
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 flex-shrink-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className='h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3'
              >
                {theme === "dark" ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
                <span className='hidden sm:inline ml-2'>{theme === "dark" ? "Light" : "Dark"}</span>
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsExportOpen(true)}
                disabled={bankAccounts.length === 0}
                className='hidden sm:flex'
              >
                <Download className='w-4 h-4 mr-2' />
                Export
              </Button>

              <Button variant='outline' size='sm' onClick={onLock} className='h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3'>
                <Lock className='w-4 h-4' />
                <span className='hidden sm:inline ml-2'>Lock</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className='bg-background/60 backdrop-blur-sm border-b border-border/50'>
        <div className='container-responsive py-2 sm:py-3'>
          <div className='flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 scrollbar-hide'>
            <Badge variant='secondary' className='whitespace-nowrap'>
              <BarChart3 className='w-3 h-3 mr-1 flex-shrink-0' />
              Total: {bankAccounts.length} accounts
            </Badge>
            <Badge variant='outline' className='whitespace-nowrap'>
              <Shield className='w-3 h-3 mr-1 flex-shrink-0' />
              {totalCredentials} credentials
            </Badge>
            {availableBanks.slice(0, window.innerWidth < 640 ? 2 : 3).map((bank) => {
              const count = bankAccounts.filter((acc) => acc.bankName === bank).length;
              return (
                <Badge key={bank} variant='outline' className='whitespace-nowrap text-xs'>
                  {bank}: {count}
                </Badge>
              );
            })}
            {availableBanks.length > (window.innerWidth < 640 ? 2 : 3) && (
              <Badge variant='outline' className='whitespace-nowrap'>
                +{availableBanks.length - (window.innerWidth < 640 ? 2 : 3)} more
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className='container-responsive py-4 sm:py-6'>
        {/* Search and Filters */}
        <div className='flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <Input
              placeholder='Search accounts, holders, or credentials...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 h-10 sm:h-11'
            />
          </div>

          <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
            <Select value={selectedBankFilter} onValueChange={setSelectedBankFilter}>
              <SelectTrigger className='w-full sm:w-[180px] h-10 sm:h-11'>
                <Filter className='w-4 h-4 mr-2 flex-shrink-0' />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Banks</SelectItem>
                {availableBanks.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsExportOpen(true)}
                disabled={bankAccounts.length === 0}
                className='flex-1 sm:hidden h-10'
              >
                <Download className='w-4 h-4 mr-2' />
                Export
              </Button>

              <Button onClick={handleNewAccount} className='flex-1 sm:flex-none h-10 sm:h-11'>
                <Plus className='w-4 h-4 mr-2' />
                <span className='hidden sm:inline'>Add Account</span>
                <span className='sm:hidden'>Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Accounts Grid */}
        {filteredAccounts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-center py-8 sm:py-12 px-4'>
            <div className='w-12 h-12 sm:w-16 sm:h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Building2 className='w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground' />
            </div>
            <h3 className='text-base sm:text-lg font-semibold mb-2'>
              {searchQuery || selectedBankFilter !== "all" ? "No matching accounts" : "No bank accounts yet"}
            </h3>
            <p className='text-sm sm:text-base text-muted-foreground mb-4 max-w-md mx-auto'>
              {searchQuery || selectedBankFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Add your first bank account to securely store your banking credentials"}
            </p>
            {!searchQuery && selectedBankFilter === "all" && (
              <Button onClick={handleNewAccount} size='lg' className='w-full sm:w-auto'>
                <Plus className='w-4 h-4 mr-2' />
                <span className='hidden sm:inline'>Add Your First Bank Account</span>
                <span className='sm:hidden'>Add Bank Account</span>
              </Button>
            )}
          </motion.div>
        ) : (
          <div className='grid-responsive'>
            <AnimatePresence mode='popLayout'>
              {filteredAccounts.map((account) => (
                <BankAccountCard
                  key={account.id}
                  account={account}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteAccount}
                  onAddCredential={handleAddCredential}
                  onEditCredential={handleEditCredential}
                  onDeleteCredential={handleDeleteCredential}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <BankAccountForm
        account={editingAccount}
        isOpen={isAccountFormOpen}
        onClose={() => {
          setIsAccountFormOpen(false);
          setEditingAccount(undefined);
        }}
        onSave={handleSaveAccount}
      />

      <CredentialForm
        credential={editingCredential?.credential}
        isOpen={isCredentialFormOpen}
        onClose={() => {
          setIsCredentialFormOpen(false);
          setEditingCredential(undefined);
        }}
        onSave={handleSaveCredential}
      />

      <ExportDialog isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}
