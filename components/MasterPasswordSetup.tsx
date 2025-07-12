"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Key } from "lucide-react";
import { CryptoService } from "@/lib/crypto";
import { storageService } from "@/lib/storage";
import { useVaultStore } from "@/lib/store";
import { toast } from "sonner";

interface MasterPasswordSetupProps {
  onComplete: () => void;
}

export function MasterPasswordSetup({ onComplete }: MasterPasswordSetupProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setFirstTime } = useVaultStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const salt = await CryptoService.setMasterKey(password);

      await storageService.saveSettings({
        salt: Array.from(salt)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
        theme: "light",
        isFirstTime: false,
        defaultBanks: [],
      });

      setFirstTime(false);
      toast.success("Master password set successfully");
      onComplete();
    } catch (error) {
      toast.error("Failed to set master password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='w-full max-w-md mx-auto'>
        <Card className='backdrop-blur-sm bg-card/50 border-border/50'>
          <CardHeader className='text-center space-y-4 px-4 sm:px-6 pt-6 sm:pt-8'>
            <div className='mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center'>
              <Shield className='w-6 h-6 sm:w-8 sm:h-8 text-primary' />
            </div>
            <CardTitle className='text-xl sm:text-2xl font-bold'>Setup Master Password</CardTitle>
            <CardDescription className='text-sm sm:text-base'>
              Create a strong master password to encrypt your vault. This password cannot be recovered if lost.
            </CardDescription>
          </CardHeader>

          <CardContent className='px-4 sm:px-6 pb-6 sm:pb-8'>
            <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-5'>
              <div className='space-y-2'>
                <Label htmlFor='password' className='flex items-center gap-2'>
                  <Lock className='w-4 h-4 flex-shrink-0' />
                  Master Password
                </Label>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Enter a strong password'
                  className='h-11 sm:h-12'
                  required
                  minLength={8}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirm-password' className='flex items-center gap-2'>
                  <Key className='w-4 h-4 flex-shrink-0' />
                  Confirm Password
                </Label>
                <Input
                  id='confirm-password'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder='Confirm your password'
                  className='h-11 sm:h-12'
                  required
                  minLength={8}
                />
              </div>

              <div className='bg-muted/30 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground'>
                <ul className='space-y-1'>
                  <li>• Use at least 8 characters</li>
                  <li>• Include numbers and special characters</li>
                  <li>• This password cannot be recovered</li>
                  <li>• All data is encrypted locally</li>
                </ul>
              </div>

              <Button type='submit' className='w-full h-11 sm:h-12 text-base font-medium' disabled={isLoading}>
                {isLoading ? "Setting up..." : "Create Vault"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
