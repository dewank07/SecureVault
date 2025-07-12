"use client";

import { useEffect, useState } from "react";
import { MasterPasswordSetup } from "@/components/MasterPasswordSetup";
import { UnlockVault } from "@/components/UnlockVault";
import { VaultDashboard } from "@/app/vault/VaultDashboard";
import { storageService } from "@/lib/storage";
import { useVaultStore } from "@/lib/store";
import { CryptoService } from "@/lib/crypto";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const { isUnlocked, isFirstTime, setFirstTime, setTheme, setBankAccounts } = useVaultStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const settings = await storageService.getSettings();
        if (settings) {
          setFirstTime(settings.isFirstTime);
          setTheme(settings.theme);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [setFirstTime, setTheme]);

  const handleSetupComplete = () => {
    // After setup, we need to show unlock screen
    window.location.reload();
  };

  const handleUnlock = async () => {
    // Load bank accounts after unlocking
    try {
      const accounts = await storageService.getAllBankAccounts();
      setBankAccounts(accounts);
    } catch (error) {
      console.error("Failed to load bank accounts:", error);
    }
  };

  const handleLock = () => {
    CryptoService.clearKey();
    useVaultStore.getState().setUnlocked(false);
    useVaultStore.getState().setBankAccounts([]);
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto'></div>
          <p className='text-muted-foreground'>Loading SecureVault...</p>
        </div>
      </div>
    );
  }

  if (isFirstTime) {
    return <MasterPasswordSetup onComplete={handleSetupComplete} />;
  }

  if (!isUnlocked) {
    return <UnlockVault onUnlock={handleUnlock} />;
  }

  return <VaultDashboard onLock={handleLock} />;
}
