/**
 * Hardware Integration Service
 * Supports: Barcode scanners, Receipt printers, Scales, Label printers, Cash drawers, Biometrics
 * Helvino Technologies Limited
 */

export interface HardwareConfig {
  barcodeScanner: {
    enabled: boolean;
    type: '1D' | '2D' | 'both';
    port?: string;
  };
  receiptPrinter: {
    enabled: boolean;
    model: string;
    port?: string;
    paperWidth: number; // in mm
  };
  scale: {
    enabled: boolean;
    port?: string;
    unit: 'kg' | 'g';
    maxWeight: number;
  };
  labelPrinter: {
    enabled: boolean;
    model: string;
    port?: string;
  };
  cashDrawer: {
    enabled: boolean;
    port?: string;
  };
  biometric: {
    enabled: boolean;
    type: 'fingerprint' | 'face';
    device?: string;
  };
}

class HardwareService {
  private config: HardwareConfig;
  private barcodeListeners: ((barcode: string) => void)[] = [];

  constructor() {
    this.config = this.loadConfig();
    this.initializeBarcodeScanner();
  }

  // Load hardware configuration
  private loadConfig(): HardwareConfig {
    if (typeof window === 'undefined') {
      return this.getDefaultConfig();
    }

    const saved = localStorage.getItem('hardwareConfig');
    return saved ? JSON.parse(saved) : this.getDefaultConfig();
  }

  // Get default configuration
  private getDefaultConfig(): HardwareConfig {
    return {
      barcodeScanner: {
        enabled: true,
        type: 'both',
      },
      receiptPrinter: {
        enabled: true,
        model: 'Epson TM-T88',
        paperWidth: 80,
      },
      scale: {
        enabled: false,
        unit: 'kg',
        maxWeight: 300,
      },
      labelPrinter: {
        enabled: false,
        model: 'Zebra ZD420',
      },
      cashDrawer: {
        enabled: true,
      },
      biometric: {
        enabled: false,
        type: 'fingerprint',
      },
    };
  }

  // Save configuration
  saveConfig(config: HardwareConfig): void {
    this.config = config;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hardwareConfig', JSON.stringify(config));
    }
  }

  // Get current configuration
  getConfig(): HardwareConfig {
    return this.config;
  }

  // ============================================================================
  // BARCODE SCANNER
  // ============================================================================

  private initializeBarcodeScanner(): void {
    if (typeof window === 'undefined' || !this.config.barcodeScanner.enabled) return;

    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyPress = (event: KeyboardEvent) => {
      const currentTime = Date.now();
      
      // Reset buffer if too much time has passed (not a scanner)
      if (currentTime - lastKeyTime > 100) {
        barcodeBuffer = '';
      }
      
      lastKeyTime = currentTime;

      // Enter key signifies end of barcode
      if (event.key === 'Enter' && barcodeBuffer.length > 0) {
        event.preventDefault();
        this.notifyBarcodeListeners(barcodeBuffer);
        barcodeBuffer = '';
      } else if (event.key.length === 1) {
        // Single character keys
        barcodeBuffer += event.key;
      }
    };

    // Remove existing listener if any
    window.removeEventListener('keypress', handleKeyPress);
    window.addEventListener('keypress', handleKeyPress);
  }

  // Register barcode listener
  onBarcodeScanned(callback: (barcode: string) => void): () => void {
    this.barcodeListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.barcodeListeners = this.barcodeListeners.filter(cb => cb !== callback);
    };
  }

  // Notify all barcode listeners
  private notifyBarcodeListeners(barcode: string): void {
    this.barcodeListeners.forEach(callback => callback(barcode));
  }

  // Manually trigger barcode scan (for testing)
  simulateBarcodeScan(barcode: string): void {
    this.notifyBarcodeListeners(barcode);
  }

  // ============================================================================
  // RECEIPT PRINTER (ESC/POS)
  // ============================================================================

  async printReceipt(data: ReceiptData): Promise<void> {
    if (!this.config.receiptPrinter.enabled) {
      console.warn('Receipt printer not enabled');
      return;
    }

    try {
      // Generate ESC/POS commands
      const commands = this.generateReceiptCommands(data);
      
      // In browser environment, use Web Serial API or print dialog
      if (typeof window !== 'undefined') {
        await this.printViaBrowser(commands, data);
      }
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  }

  private generateReceiptCommands(data: ReceiptData): string {
    const { sale, company, items } = data;
    
    let receipt = '';
    
    // Header
    receipt += this.escposCenter();
    receipt += this.escposBold(true);
    receipt += this.escposDoubleHeight(true);
    receipt += `${company.name}\n`;
    receipt += this.escposDoubleHeight(false);
    receipt += this.escposBold(false);
    receipt += `${company.address}\n`;
    receipt += `${company.phone}\n`;
    receipt += `${company.email}\n`;
    receipt += this.escposAlign('left');
    receipt += this.escposLine();
    
    // Receipt info
    receipt += `Receipt: ${sale.receiptNumber}\n`;
    receipt += `Date: ${new Date(sale.saleDate).toLocaleString()}\n`;
    if (sale.customer) {
      receipt += `Customer: ${sale.customer.customerName}\n`;
    }
    receipt += this.escposLine();
    
    // Items
    items.forEach(item => {
      receipt += `${item.description}\n`;
      receipt += `  ${item.quantity} x ${this.formatCurrency(item.unitPrice)}`;
      if (item.discountPercentage > 0) {
        receipt += ` (-${item.discountPercentage}%)`;
      }
      receipt += `\n`;
      receipt += `  ${' '.repeat(20)}${this.formatCurrency(item.lineTotal)}\n`;
    });
    
    receipt += this.escposLine();
    
    // Totals
    receipt += this.escposAlign('right');
    receipt += `Subtotal: ${this.formatCurrency(sale.subtotal)}\n`;
    if (sale.discountAmount > 0) {
      receipt += `Discount: -${this.formatCurrency(sale.discountAmount)}\n`;
    }
    receipt += `Tax: ${this.formatCurrency(sale.taxAmount)}\n`;
    receipt += this.escposBold(true);
    receipt += this.escposDoubleHeight(true);
    receipt += `TOTAL: ${this.formatCurrency(sale.totalAmount)}\n`;
    receipt += this.escposDoubleHeight(false);
    receipt += this.escposBold(false);
    
    if (sale.paymentMethod) {
      receipt += `\nPayment: ${sale.paymentMethod.toUpperCase()}\n`;
      receipt += `Paid: ${this.formatCurrency(sale.amountPaid)}\n`;
      if (sale.amountDue > 0) {
        receipt += `Balance: ${this.formatCurrency(sale.amountDue)}\n`;
      }
    }
    
    // Footer
    receipt += this.escposAlign('center');
    receipt += this.escposLine();
    receipt += '\nThank you for your business!\n';
    receipt += 'Powered by HARD-POS PRO\n';
    receipt += 'Helvino Technologies Limited\n';
    receipt += '\n\n\n';
    
    // Cut paper
    receipt += this.escposCut();
    
    return receipt;
  }

  // ESC/POS command helpers
  private escposCenter(): string { return '\x1b\x61\x01'; }
  private escposAlign(align: 'left' | 'center' | 'right'): string {
    const codes = { left: '\x1b\x61\x00', center: '\x1b\x61\x01', right: '\x1b\x61\x02' };
    return codes[align];
  }
  private escposBold(enable: boolean): string { return enable ? '\x1b\x45\x01' : '\x1b\x45\x00'; }
  private escposDoubleHeight(enable: boolean): string { return enable ? '\x1b\x21\x10' : '\x1b\x21\x00'; }
  private escposLine(): string { return '-'.repeat(32) + '\n'; }
  private escposCut(): string { return '\x1d\x56\x00'; }

  private async printViaBrowser(commands: string, data: ReceiptData): Promise<void> {
    // Try Web Serial API first (for USB printers)
    if ('serial' in navigator) {
      try {
        await this.printViaSerial(commands);
        return;
      } catch (error) {
        console.warn('Serial printing failed, falling back to print dialog');
      }
    }

    // Fallback to browser print dialog
    this.printViaDialog(data);
  }

  private async printViaSerial(commands: string): Promise<void> {
    // @ts-ignore
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    
    const writer = port.writable.getWriter();
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(commands));
    
    writer.releaseLock();
    await port.close();
  }

  private printViaDialog(data: ReceiptData): void {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;

    const html = this.generateReceiptHTML(data);
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  private generateReceiptHTML(data: ReceiptData): string {
    const { sale, company, items } = data;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${sale.receiptNumber}</title>
        <style>
          body { font-family: monospace; width: 300px; margin: 20px auto; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 1.2em; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          table { width: 100%; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="center bold large">${company.name}</div>
        <div class="center">${company.address}</div>
        <div class="center">${company.phone}</div>
        <div class="line"></div>
        <div>Receipt: ${sale.receiptNumber}</div>
        <div>Date: ${new Date(sale.saleDate).toLocaleString()}</div>
        ${sale.customer ? `<div>Customer: ${sale.customer.customerName}</div>` : ''}
        <div class="line"></div>
        <table>
          ${items.map(item => `
            <tr>
              <td colspan="2">${item.description}</td>
            </tr>
            <tr>
              <td>${item.quantity} x ${this.formatCurrency(item.unitPrice)}</td>
              <td class="right">${this.formatCurrency(item.lineTotal)}</td>
            </tr>
          `).join('')}
        </table>
        <div class="line"></div>
        <table>
          <tr><td>Subtotal:</td><td class="right">${this.formatCurrency(sale.subtotal)}</td></tr>
          ${sale.discountAmount > 0 ? `<tr><td>Discount:</td><td class="right">-${this.formatCurrency(sale.discountAmount)}</td></tr>` : ''}
          <tr><td>Tax:</td><td class="right">${this.formatCurrency(sale.taxAmount)}</td></tr>
          <tr class="bold"><td>TOTAL:</td><td class="right">${this.formatCurrency(sale.totalAmount)}</td></tr>
        </table>
        <div class="line"></div>
        <div class="center">Thank you for your business!</div>
        <div class="center">Powered by HARD-POS PRO</div>
        <div class="center">Helvino Technologies Limited</div>
      </body>
      </html>
    `;
  }

  private formatCurrency(amount: number): string {
    return `KES ${amount.toFixed(2)}`;
  }

  // ============================================================================
  // DIGITAL WEIGHING SCALE
  // ============================================================================

  async getWeight(): Promise<number> {
    if (!this.config.scale.enabled) {
      throw new Error('Scale not enabled');
    }

    try {
      // Try to connect to scale via Web Serial API
      if ('serial' in navigator) {
        return await this.readWeightFromSerial();
      }
      
      // Fallback: manual entry
      return await this.getWeightManually();
    } catch (error) {
      console.error('Scale reading error:', error);
      throw error;
    }
  }

  private async readWeightFromSerial(): Promise<number> {
    // @ts-ignore
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    
    const reader = port.readable.getReader();
    const { value } = await reader.read();
    
    reader.releaseLock();
    await port.close();
    
    // Parse weight from scale response
    const decoder = new TextDecoder();
    const response = decoder.decode(value);
    const weight = parseFloat(response.match(/[\d.]+/)?.[0] || '0');
    
    return weight;
  }

  private async getWeightManually(): Promise<number> {
    return new Promise((resolve) => {
      const weight = prompt('Enter weight (kg):');
      resolve(parseFloat(weight || '0'));
    });
  }

  // ============================================================================
  // LABEL PRINTER
  // ============================================================================

  async printLabel(data: LabelData): Promise<void> {
    if (!this.config.labelPrinter.enabled) {
      console.warn('Label printer not enabled');
      return;
    }

    try {
      const zpl = this.generateZPLCommands(data);
      await this.sendToLabelPrinter(zpl);
    } catch (error) {
      console.error('Label print error:', error);
      throw error;
    }
  }

  private generateZPLCommands(data: LabelData): string {
    // ZPL (Zebra Programming Language) commands
    let zpl = '^XA\n'; // Start format
    
    // Product name
    zpl += '^FO50,50^A0N,40,40^FD' + data.productName + '^FS\n';
    
    // Barcode
    if (data.barcode) {
      zpl += '^FO50,120^BY2^BCN,100,Y,N,N^FD' + data.barcode + '^FS\n';
    }
    
    // Price
    zpl += '^FO50,250^A0N,35,35^FDKES ' + data.price.toFixed(2) + '^FS\n';
    
    // Product code
    zpl += '^FO50,300^A0N,25,25^FD' + data.productCode + '^FS\n';
    
    zpl += '^XZ\n'; // End format
    
    return zpl;
  }

  private async sendToLabelPrinter(zpl: string): Promise<void> {
    // Implementation would depend on printer connection method
    console.log('Sending to label printer:', zpl);
    
    // For now, show in dialog
    if (typeof window !== 'undefined') {
      alert('Label would be printed:\n' + zpl);
    }
  }

  // ============================================================================
  // CASH DRAWER
  // ============================================================================

  async openCashDrawer(): Promise<void> {
    if (!this.config.cashDrawer.enabled) {
      console.warn('Cash drawer not enabled');
      return;
    }

    try {
      // ESC/POS command to open cash drawer
      const openCommand = '\x1b\x70\x00\x19\xfa';
      
      if ('serial' in navigator) {
        // @ts-ignore
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        
        const writer = port.writable.getWriter();
        const encoder = new TextEncoder();
        await writer.write(encoder.encode(openCommand));
        
        writer.releaseLock();
        await port.close();
      } else {
        console.log('Cash drawer opened (simulated)');
      }
    } catch (error) {
      console.error('Cash drawer error:', error);
    }
  }

  // ============================================================================
  // BIOMETRIC DEVICE
  // ============================================================================

  async captureFingerprint(): Promise<string> {
    if (!this.config.biometric.enabled) {
      throw new Error('Biometric device not enabled');
    }

    try {
      // This would integrate with actual biometric SDK
      // For now, return simulated data
      return await this.simulateFingerprintCapture();
    } catch (error) {
      console.error('Fingerprint capture error:', error);
      throw error;
    }
  }

  private async simulateFingerprintCapture(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return simulated fingerprint hash
        resolve('FINGERPRINT_' + Date.now());
      }, 2000);
    });
  }

  async verifyFingerprint(storedTemplate: string): Promise<boolean> {
    if (!this.config.biometric.enabled) {
      throw new Error('Biometric device not enabled');
    }

    try {
      const captured = await this.captureFingerprint();
      // In real implementation, this would compare templates
      return captured === storedTemplate;
    } catch (error) {
      console.error('Fingerprint verification error:', error);
      return false;
    }
  }

  // ============================================================================
  // HARDWARE STATUS
  // ============================================================================

  async checkHardwareStatus(): Promise<HardwareStatus> {
    return {
      barcodeScanner: {
        connected: this.config.barcodeScanner.enabled,
        status: 'ready',
      },
      receiptPrinter: {
        connected: this.config.receiptPrinter.enabled,
        status: 'ready',
        paperLevel: 'high',
      },
      scale: {
        connected: this.config.scale.enabled,
        status: this.config.scale.enabled ? 'ready' : 'disconnected',
      },
      labelPrinter: {
        connected: this.config.labelPrinter.enabled,
        status: this.config.labelPrinter.enabled ? 'ready' : 'disconnected',
      },
      cashDrawer: {
        connected: this.config.cashDrawer.enabled,
        status: this.config.cashDrawer.enabled ? 'ready' : 'disconnected',
        isOpen: false,
      },
      biometric: {
        connected: this.config.biometric.enabled,
        status: this.config.biometric.enabled ? 'ready' : 'disconnected',
      },
    };
  }
}

// Types
export interface ReceiptData {
  sale: any;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  items: any[];
}

export interface LabelData {
  productCode: string;
  productName: string;
  barcode?: string;
  price: number;
  expiryDate?: string;
}

export interface HardwareStatus {
  barcodeScanner: {
    connected: boolean;
    status: string;
  };
  receiptPrinter: {
    connected: boolean;
    status: string;
    paperLevel?: string;
  };
  scale: {
    connected: boolean;
    status: string;
  };
  labelPrinter: {
    connected: boolean;
    status: string;
  };
  cashDrawer: {
    connected: boolean;
    status: string;
    isOpen: boolean;
  };
  biometric: {
    connected: boolean;
    status: string;
  };
}

export const hardwareService = new HardwareService();
export default hardwareService;
