import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { BankAccount, BankCredential } from "./storage";
import { CryptoService } from "./crypto";

export async function exportToPDF(bankAccounts: BankAccount[], password: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  let currentPage = pdfDoc.addPage();
  let { width, height } = currentPage.getSize();
  let yPosition = height - 50;

  // Title
  currentPage.drawText("dewault - Banking Credentials Export", {
    x: 50,
    y: yPosition,
    size: 18,
    font: timesRomanBoldFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 30;

  // Export date and summary
  currentPage.drawText(`Exported on: ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  yPosition -= 20;

  const totalCredentials = bankAccounts.reduce((sum, account) => sum + account.credentials.length, 0);
  currentPage.drawText(`Total Accounts: ${bankAccounts.length} | Total Credentials: ${totalCredentials}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  yPosition -= 40;

  // Process each bank account
  for (const account of bankAccounts) {
    // Check if we need a new page
    if (yPosition < 150) {
      currentPage = pdfDoc.addPage();
      yPosition = height - 50;
    }

    // Bank Account Header
    currentPage.drawText(`${account.bankName}`, {
      x: 50,
      y: yPosition,
      size: 16,
      font: timesRomanBoldFont,
      color: rgb(0.2, 0.2, 0.8),
    });

    yPosition -= 25;

    // Account Details
    currentPage.drawText(`Account Holder: ${account.accountHolderName}`, {
      x: 70,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 18;

    currentPage.drawText(`Account Number: ${account.accountNumber}`, {
      x: 70,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 18;

    currentPage.drawText(`Account Type: ${account.accountType.toUpperCase()}`, {
      x: 70,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 25;

    // Credentials
    if (account.credentials.length > 0) {
      currentPage.drawText("Credentials:", {
        x: 70,
        y: yPosition,
        size: 14,
        font: timesRomanBoldFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 20;

      for (const credential of account.credentials) {
        // Check if we need a new page
        if (yPosition < 100) {
          currentPage = pdfDoc.addPage();
          yPosition = height - 50;
        }

        try {
          const decryptedValue = await CryptoService.decrypt(credential.encryptedValue);

          currentPage.drawText(`• ${credential.label}:`, {
            x: 90,
            y: yPosition,
            size: 12,
            font: timesRomanBoldFont,
            color: rgb(0, 0, 0),
          });

          yPosition -= 18;

          currentPage.drawText(`  ${decryptedValue}`, {
            x: 110,
            y: yPosition,
            size: 11,
            font: timesRomanFont,
            color: rgb(0.3, 0.3, 0.3),
          });

          yPosition -= 15;

          if (credential.notes) {
            currentPage.drawText(`  Notes: ${credential.notes}`, {
              x: 110,
              y: yPosition,
              size: 10,
              font: timesRomanFont,
              color: rgb(0.6, 0.6, 0.6),
            });
            yPosition -= 15;
          }

          yPosition -= 5;
        } catch (error) {
          console.error("Error decrypting credential for PDF:", error);
          currentPage.drawText(`• ${credential.label}: [Decryption Error]`, {
            x: 90,
            y: yPosition,
            size: 12,
            font: timesRomanFont,
            color: rgb(0.8, 0, 0),
          });
          yPosition -= 25;
        }
      }
    } else {
      currentPage.drawText("No credentials stored", {
        x: 90,
        y: yPosition,
        size: 12,
        font: timesRomanFont,
        color: rgb(0.6, 0.6, 0.6),
      });
      yPosition -= 20;
    }

    yPosition -= 30; // Space between accounts
  }

  // Add footer with security notice
  const pages = pdfDoc.getPages();
  pages.forEach((page, index) => {
    page.drawText(`Page ${index + 1} of ${pages.length} | This document contains sensitive financial information`, {
      x: 50,
      y: 30,
      size: 8,
      font: timesRomanFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  // Encrypt the PDF
  // pdfDoc.encrypt({
  //   userPassword: password,
  //   ownerPassword: password,
  //   permissions: {
  //     printing: 'highResolution',
  //     modifying: false,
  //     copying: false,
  //     annotating: false,
  //     fillingForms: false,
  //     contentAccessibility: true,
  //     documentAssembly: false,
  //   }
  // });

  return await pdfDoc.save();
}
