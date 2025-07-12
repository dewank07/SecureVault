"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BankAccount, INDIAN_BANKS } from "@/lib/storage";
import { toast } from "sonner";

interface BankAccountFormProps {
  account?: BankAccount;
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: BankAccount) => void;
}

export function BankAccountForm({ account, isOpen, onClose, onSave }: BankAccountFormProps) {
  const [bankName, setBankName] = useState("");
  const [customBankName, setCustomBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<BankAccount["accountType"]>("savings");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setBankName(INDIAN_BANKS.includes(account.bankName) ? account.bankName : "Other");
      setCustomBankName(INDIAN_BANKS.includes(account.bankName) ? "" : account.bankName);
      setAccountNumber(account.accountNumber);
      setAccountType(account.accountType);
      setAccountHolderName(account.accountHolderName);
      setNotes(account.notes || "");
    } else {
      setBankName("");
      setCustomBankName("");
      setAccountNumber("");
      setAccountType("savings");
      setAccountHolderName("");
      setNotes("");
    }
  }, [account, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalBankName = bankName === "Other" ? customBankName.trim() : bankName;

    if (!finalBankName || !accountNumber.trim() || !accountHolderName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (bankName === "Other" && !customBankName.trim()) {
      toast.error("Please enter the bank name");
      return;
    }

    setIsLoading(true);
    try {
      const now = new Date();

      const bankAccount: BankAccount = {
        id: account?.id || crypto.randomUUID(),
        bankName: finalBankName,
        accountNumber: accountNumber.trim(),
        accountType,
        accountHolderName: accountHolderName.trim(),
        credentials: account?.credentials || [],
        createdAt: account?.createdAt || now,
        updatedAt: now,
        isActive: account?.isActive ?? true,
        notes: notes.trim() || undefined,
      };

      onSave(bankAccount);
      onClose();
      toast.success(account ? "Account updated" : "Account created");
    } catch (error) {
      toast.error("Failed to save account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='w-[95vw] max-w-md max-h-[90vh] overflow-y-auto mx-auto'>
        <DialogHeader>
          <DialogTitle>{account ? "Edit Bank Account" : "Add New Bank Account"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 px-1'>
          <div className='space-y-2'>
            <Label htmlFor='bank-name'>Bank Name *</Label>
            <Select value={bankName} onValueChange={setBankName}>
              <SelectTrigger className='h-11'>
                <SelectValue placeholder='Select a bank' />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_BANKS.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {bankName === "Other" && (
            <div className='space-y-2'>
              <Label htmlFor='custom-bank'>Custom Bank Name *</Label>
              <Input
                id='custom-bank'
                value={customBankName}
                onChange={(e) => setCustomBankName(e.target.value)}
                placeholder='Enter bank name'
                className='h-11'
                required
              />
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='account-holder'>Account Holder Name *</Label>
            <Input
              id='account-holder'
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder='Enter account holder name'
              className='h-11'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='account-number'>Account Number *</Label>
            <Input
              id='account-number'
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder='Enter account number or last 4 digits'
              className='h-11'
              required
            />
            <p className='text-xs text-muted-foreground'>
              You can enter the full account number or just the last 4 digits for security
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='account-type'>Account Type</Label>
            <Select value={accountType} onValueChange={(value) => setAccountType(value as BankAccount["accountType"])}>
              <SelectTrigger className='h-11'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='savings'>Savings Account</SelectItem>
                <SelectItem value='current'>Current Account</SelectItem>
                <SelectItem value='salary'>Salary Account</SelectItem>
                <SelectItem value='fd'>Fixed Deposit</SelectItem>
                <SelectItem value='rd'>Recurring Deposit</SelectItem>
                <SelectItem value='credit_card'>Credit Card</SelectItem>
                <SelectItem value='other'>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='notes'>Notes (Optional)</Label>
            <Textarea
              id='notes'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Add any additional notes about this account'
              className='min-h-[80px] resize-none'
              rows={3}
            />
          </div>

          <DialogFooter className='flex-col sm:flex-row gap-2 sm:gap-0 pt-4'>
            <Button type='button' variant='outline' onClick={onClose} className='w-full sm:w-auto order-2 sm:order-1'>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading} className='w-full sm:w-auto order-1 sm:order-2'>
              {isLoading ? "Saving..." : account ? "Update Account" : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
