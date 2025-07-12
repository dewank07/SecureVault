'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Shield } from 'lucide-react';
import { CryptoService } from '@/lib/crypto';
import { storageService } from '@/lib/storage';
import { useVaultStore } from '@/lib/store';
import { toast } from 'sonner';

interface UnlockVaultProps {
  onUnlock: () => void;
}

export function UnlockVault({ onUnlock }: UnlockVaultProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUnlocked } = useVaultStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const settings = await storageService.getSettings();
      if (!settings) {
        toast.error('No vault found');
        return;
      }

      const salt = new Uint8Array(
        settings.salt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );

      await CryptoService.setMasterKey(password, salt);
      setUnlocked(true);
      toast.success('Vault unlocked');
      onUnlock();
    } catch (error) {
      toast.error('Invalid password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-card/50 border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Unlock Vault</CardTitle>
            <CardDescription>
              Enter your master password to access your encrypted vault
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Master Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your master password"
                  required
                  autoFocus
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Unlocking...' : 'Unlock Vault'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}