'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  CreditCard, 
  Edit2, 
  Trash2, 
  Plus,
  ChevronDown,
  ChevronUp,
  User,
  Hash
} from 'lucide-react';
import { BankAccount } from '@/lib/storage';
import { CredentialItem } from './CredentialItem';

interface BankAccountCardProps {
  account: BankAccount;
  onEdit: (account: BankAccount) => void;
  onDelete: (id: string) => void;
  onAddCredential: (accountId: string) => void;
  onEditCredential: (accountId: string, credentialId: string) => void;
  onDeleteCredential: (accountId: string, credentialId: string) => void;
}

const accountTypeColors = {
  savings: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  current: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  salary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  fd: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  rd: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  credit_card: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

export function BankAccountCard({ 
  account, 
  onEdit, 
  onDelete, 
  onAddCredential,
  onEditCredential,
  onDeleteCredential 
}: BankAccountCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
      className="w-full"
    >
      <Card className="group hover:shadow-lg transition-all duration-200 bg-card/50 backdrop-blur-sm border-border/50 h-full flex flex-col">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg font-semibold truncate">{account.bankName}</CardTitle>
                <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">{account.accountHolderName}</span>
                </div>
              </div>
            </div>
            <Badge className={`${accountTypeColors[account.accountType]} text-xs whitespace-nowrap flex-shrink-0`}>
              {account.accountType.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3 px-4 sm:px-6 flex-1">
          <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm">
            <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
            <span className="font-mono bg-muted/30 rounded px-2 py-1 truncate flex-1">
              {account.accountNumber}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {account.credentials.length} credential{account.credentials.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </Button>
          </div>

          {/* Expanded Credentials */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3 border-t pt-4"
            >
              {account.credentials.length > 0 ? (
                account.credentials.map((credential) => (
                  <CredentialItem
                    key={credential.id}
                    credential={credential}
                    onEdit={() => onEditCredential(account.id, credential.id)}
                    onDelete={() => onDeleteCredential(account.id, credential.id)}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">No credentials stored</p>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddCredential(account.id)}
                className="w-full mt-3 text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Add Credential
              </Button>
            </motion.div>
          )}

          <p className="text-xs text-muted-foreground mt-3 sm:mt-4">
            Updated {new Date(account.updatedAt).toLocaleDateString()}
          </p>
        </CardContent>

        <CardFooter className="pt-0 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddCredential(account.id)}
              className="flex-1 text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Add Credential
            </Button>
            
            <div className="flex gap-2 sm:flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(account)}
                className="flex-1 sm:flex-none"
              >
                <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="ml-2 sm:hidden">Edit</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(account.id)}
                className="text-destructive hover:text-destructive flex-1 sm:flex-none"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="ml-2 sm:hidden">Delete</span>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}