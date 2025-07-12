'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Download, Upload } from 'lucide-react';
import { exportToPDF } from '@/lib/pdf';
import { GoogleDriveService } from '@/lib/google-drive';
import { useVaultStore } from '@/lib/store';
import { toast } from 'sonner';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const { bankAccounts, getTotalCredentials } = useVaultStore();
  const [password, setPassword] = useState('');
  const [uploadToDrive, setUploadToDrive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalCredentials = getTotalCredentials();

  const handleExport = async () => {
    if (!password.trim()) {
      toast.error('Please enter a password for the PDF');
      return;
    }

    if (bankAccounts.length === 0) {
      toast.error('No bank accounts to export');
      return;
    }

    setIsLoading(true);
    try {
      const pdfBytes = await exportToPDF(bankAccounts, password);
      const fileName = `securevault-banking-export-${new Date().toISOString().split('T')[0]}.pdf`;

      if (uploadToDrive) {
        const fileId = await GoogleDriveService.uploadFile(pdfBytes, fileName);
        toast.success('PDF exported and uploaded to Google Drive');
      } else {
        // Download locally
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('PDF exported successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Banking Vault</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pdf-password">PDF Password</Label>
            <Input
              id="pdf-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to protect PDF"
              required
            />
            <p className="text-sm text-muted-foreground">
              This password will be required to open the exported PDF
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="upload-drive"
              checked={uploadToDrive}
              onCheckedChange={setUploadToDrive}
            />
            <Label htmlFor="upload-drive">Upload to Google Drive</Label>
          </div>
          
          <div className="bg-muted/30 rounded p-3 text-sm text-muted-foreground">
            <p>
              <strong>{bankAccounts.length} bank accounts</strong> with{' '}
              <strong>{totalCredentials} credentials</strong> will be exported to an encrypted PDF.
              {uploadToDrive ? ' The file will be uploaded to your Google Drive.' : ' The file will be downloaded to your device.'}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isLoading || bankAccounts.length === 0}>
            {isLoading ? 'Exporting...' : (
              <>
                {uploadToDrive ? <Upload className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}