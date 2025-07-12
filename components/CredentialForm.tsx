"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BankCredential, CREDENTIAL_TYPES } from "@/lib/storage";
import { CryptoService } from "@/lib/crypto";
import { toast } from "sonner";

interface CredentialFormProps {
  credential?: BankCredential;
  isOpen: boolean;
  onClose: () => void;
  onSave: (credential: BankCredential) => void;
}

export function CredentialForm({ credential, isOpen, onClose, onSave }: CredentialFormProps) {
  const [type, setType] = useState<BankCredential["type"]>("upi_pin");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (credential) {
      setType(credential.type);
      setLabel(credential.label);
      setNotes(credential.notes || "");
      // Decrypt the value for editing
      if (isOpen) {
        CryptoService.decrypt(credential.encryptedValue)
          .then(setValue)
          .catch(() => toast.error("Failed to decrypt credential"));
      }
    } else {
      setType("upi_pin");
      setLabel("");
      setValue("");
      setNotes("");
    }
  }, [credential, isOpen]);

  // Auto-generate label based on type
  useEffect(() => {
    if (!credential) {
      const credentialType = CREDENTIAL_TYPES.find((ct) => ct.value === type);
      if (credentialType) {
        setLabel(credentialType.label);
      }
    }
  }, [type, credential]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !value.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const encryptedValue = await CryptoService.encrypt(value);
      const now = new Date();

      const bankCredential: BankCredential = {
        id: credential?.id || crypto.randomUUID(),
        type,
        label: label.trim(),
        encryptedValue,
        createdAt: credential?.createdAt || now,
        updatedAt: now,
        notes: notes.trim() || undefined,
      };

      onSave(bankCredential);
      onClose();
      toast.success(credential ? "Credential updated" : "Credential created");
    } catch (error) {
      toast.error("Failed to save credential");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCredentialType = CREDENTIAL_TYPES.find((ct) => ct.value === type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='w-[95vw] max-w-md max-h-[90vh] overflow-y-auto mx-auto'>
        <DialogHeader>
          <DialogTitle>{credential ? "Edit Credential" : "Add New Credential"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 px-1'>
          <div className='space-y-2'>
            <Label htmlFor='type'>Credential Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as BankCredential["type"])}>
              <SelectTrigger className='h-11'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREDENTIAL_TYPES.map((credType) => (
                  <SelectItem key={credType.value} value={credType.value}>
                    <div>
                      <div className='font-medium'>{credType.label}</div>
                      <div className='text-xs text-muted-foreground'>{credType.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='label'>Label *</Label>
            <Input
              id='label'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='e.g., UPI PIN, ATM PIN'
              className='h-11'
              required
            />
            {selectedCredentialType && (
              <p className='text-xs text-muted-foreground'>{selectedCredentialType.description}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='value'>Value *</Label>
            <Input
              id='value'
              type='password'
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter the credential value'
              className='h-11'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='notes'>Notes (Optional)</Label>
            <Textarea
              id='notes'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Add any additional notes about this credential'
              className='min-h-[80px] resize-none'
              rows={3}
            />
          </div>

          <DialogFooter className='flex-col sm:flex-row gap-2 sm:gap-0 pt-4'>
            <Button type='button' variant='outline' onClick={onClose} className='w-full sm:w-auto order-2 sm:order-1'>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading} className='w-full sm:w-auto order-1 sm:order-2'>
              {isLoading ? "Saving..." : credential ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
