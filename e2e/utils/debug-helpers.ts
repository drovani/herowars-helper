import type { Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface ConsoleMessage {
  type: string;
  text: string;
  location?: string;
  timestamp: number;
}

export interface DebugSession {
  consoleMessages: ConsoleMessage[];
  errors: ConsoleMessage[];
  warnings: ConsoleMessage[];
}

/**
 * Debug helper class for capturing DOM snapshots and console messages
 */
export class DebugHelper {
  private consoleMessages: ConsoleMessage[] = [];
  private page: Page;
  private testName: string;

  constructor(page: Page, testName: string) {
    this.page = page;
    this.testName = testName;
    this.setupConsoleCapture();
  }

  /**
   * Set up console message capture
   */
  private setupConsoleCapture(): void {
    this.page.on('console', (msg) => {
      const consoleMessage: ConsoleMessage = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location()?.url || undefined,
        timestamp: Date.now(),
      };

      this.consoleMessages.push(consoleMessage);

      // Log errors and warnings immediately for visibility
      if (msg.type() === 'error') {
        console.error(`[BROWSER ERROR] ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        console.warn(`[BROWSER WARNING] ${msg.text()}`);
      }
    });

    // Capture page errors
    this.page.on('pageerror', (error) => {
      const errorMessage: ConsoleMessage = {
        type: 'pageerror',
        text: error.message,
        timestamp: Date.now(),
      };

      this.consoleMessages.push(errorMessage);
      console.error(`[PAGE ERROR] ${error.message}`);
    });
  }

  /**
   * Take a DOM snapshot and save it to disk
   */
  async takeDOMSnapshot(stepName: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${this.testName}-${stepName}-${timestamp}`;

    // Create snapshots directory
    const snapshotsDir = join(process.cwd(), 'playwright-report', 'snapshots');
    mkdirSync(snapshotsDir, { recursive: true });

    // Save HTML snapshot
    const html = await this.page.content();
    writeFileSync(join(snapshotsDir, `${filename}.html`), html);

    // Save screenshot
    await this.page.screenshot({
      path: join(snapshotsDir, `${filename}.png`),
      fullPage: true
    });

    console.log(`📸 DOM snapshot saved: ${filename}`);
  }

  /**
   * Get all console messages
   */
  getConsoleMessages(): ConsoleMessage[] {
    return this.consoleMessages;
  }

  /**
   * Get only error messages
   */
  getErrors(): ConsoleMessage[] {
    return this.consoleMessages.filter(msg =>
      msg.type === 'error' || msg.type === 'pageerror'
    );
  }

  /**
   * Get only warning messages
   */
  getWarnings(): ConsoleMessage[] {
    return this.consoleMessages.filter(msg => msg.type === 'warning');
  }

  /**
   * Assert no console errors occurred (ignoring development-specific errors)
   */
  async assertNoConsoleErrors(): Promise<void> {
    const errors = this.getErrors();
    
    // Filter out development-specific errors that are expected during testing
    const significantErrors = errors.filter(error => {
      const errorText = error.text.toLowerCase();
      return !errorText.includes('failed to fetch manifest patches') &&
             !errorText.includes('network error') &&
             !errorText.includes('hmr') &&
             !errorText.includes('vite') &&
             !errorText.includes('sockjs');
    });
    
    if (significantErrors.length > 0) {
      const errorMessages = significantErrors.map(e => e.text).join('\n');
      throw new Error(`Console errors detected:\n${errorMessages}`);
    }
  }

  /**
   * Generate a comprehensive debug report
   */
  async generateDebugReport(): Promise<DebugSession> {
    const report: DebugSession = {
      consoleMessages: this.consoleMessages,
      errors: this.getErrors(),
      warnings: this.getWarnings(),
    };

    // Save report to disk
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = join(process.cwd(), 'playwright-report', 'debug-reports');
    mkdirSync(reportDir, { recursive: true });

    const reportPath = join(reportDir, `${this.testName}-${timestamp}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📋 Debug report saved: ${reportPath}`);
    return report;
  }

  /**
   * Wait for network to be idle (useful for debugging async issues)
   */
  async waitForNetworkIdle(timeout = 5000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Log current page state for debugging
   */
  async logPageState(): Promise<void> {
    try {
      const url = this.page.url();
      const title = await this.page.title().catch(() => 'Unable to get title');
      const errors = this.getErrors();
      const warnings = this.getWarnings();

      console.log(`
🔍 Page State Debug:
  URL: ${url}
  Title: ${title}
  Console Errors: ${errors.length}
  Console Warnings: ${warnings.length}
  Recent Messages: ${this.consoleMessages.slice(-5).map(m => `${m.type}: ${m.text}`).join(', ')}
    `);
    } catch (error) {
      console.log(`🔍 Page State Debug: Unable to get page state - ${error}`);
    }
  }
}

/**
 * Helper function to create a debug helper instance
 */
export function createDebugHelper(page: Page, testName: string): DebugHelper {
  return new DebugHelper(page, testName);
}