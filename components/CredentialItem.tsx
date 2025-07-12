'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Edit2, 
  Eye, 
  EyeOff, 
  Trash2,
  Smartphone,
  CreditCard,
  Globe,
  Lock,
  Key,
  Shield,
  MoreHorizontal
} from 'lucide-react';
import { BankCredential } from '@/lib/storage';
import { CryptoService } from '@/lib/crypto';
import { toast } from 'sonner';

interface CredentialItemProps {
  credential: BankCredential;
  onEdit: () => void;
  onDelete: () => void;
}

const credentialIcons = {
  upi_pin: Smartphone,
  atm_pin: CreditCard,
  net_banking: Globe,
  mobile_banking: Smartphone,
  transaction_password: Lock,
  debit_card_pin: CreditCard,
  credit_card_pin: CreditCard,
  other: MoreHorizontal
};

const credentialColors = {
  upi_pin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  atm_pin: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  net_banking: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  mobile_banking: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  transaction_password: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  debit_card_pin: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  credit_card_pin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

export function CredentialItem({ credential, onEdit, onDelete }: CredentialItemProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [decryptedValue, setDecryptedValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const CredentialIcon = credentialIcons[credential.type];

  const handleReveal = async () => {
    if (isRevealed) {
      setIsRevealed(false);
      setDecryptedValue('');
      return;
    }

    setIsLoading(true);
    try {
      const value = await CryptoService.decrypt(credential.encryptedValue);
      setDecryptedValue(value);
      setIsRevealed(true);
    } catch (error) {
      toast.error('Failed to decrypt credential');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!isRevealed || !decryptedValue) {
      await handleReveal();
      return;
    }

    try {
      await navigator.clipboard.writeText(decryptedValue);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="bg-muted/20 rounded-lg p-3 sm:p-4 border border-border/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <CredentialIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-sm truncate">{credential.label}</span>
        </div>
        <Badge className={`${credentialColors[credential.type]} text-xs whitespace-nowrap flex-shrink-0`} variant="secondary">
          {credential.type.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>
      
      <div className="font-mono text-sm bg-background/50 rounded p-3 mb-3 border min-h-[2.5rem] flex items-center">
        {isRevealed ? (
          <span className="select-all break-all">{decryptedValue}</span>
        ) : (
          <span className="text-muted-foreground">{'•'.repeat(8)}</span>
        )}
      </div>

      {credential.notes && (
        <p className="text-xs text-muted-foreground mb-3 italic break-words">
          {credential.notes}
        </p>
      )}
      
      <div className="flex flex-wrap gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReveal}
          disabled={isLoading}
          className="h-8 px-2 text-xs flex-1 sm:flex-none min-w-0"
        >
          {isRevealed ? (
            <>
              <EyeOff className="w-3 h-3" />
              <span className="ml-1 sm:hidden">Hide</span>
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              <span className="ml-1 sm:hidden">Show</span>
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2 text-xs flex-1 sm:flex-none min-w-0"
        >
          <Copy className="w-3 h-3" />
          <span className="ml-1 sm:hidden">Copy</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 px-2 text-xs flex-1 sm:flex-none min-w-0"
        >
          <Edit2 className="w-3 h-3" />
          <span className="ml-1 sm:hidden">Edit</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 px-2 text-xs text-destructive hover:text-destructive flex-1 sm:flex-none min-w-0"
        >
          <Trash2 className="w-3 h-3" />
          <span className="ml-1 sm:hidden">Delete</span>
        </Button>
      </div>
    </div>
  );
}