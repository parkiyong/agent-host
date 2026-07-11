import { RuntimeProvider } from '../runtimes/types';
import { Workflow, Toolchain } from './manager';

export class Provisioner {
  constructor(private runtime: RuntimeProvider) {}

  async provision(containerId: string, toolchain: Toolchain): Promise<void> {
    console.log(`Provisioning toolchain for container ${containerId}...`);

    // 1. System Packages
    if (toolchain.systemPackages.length > 0) {
      const pkgList = toolchain.systemPackages.join(' ');
      await this.runCommand(containerId, `apt-get update && apt-get install -y ${pkgList}`);
    }

    // 2. NPM Packages
    if (toolchain.npmPackages.length > 0) {
      const pkgList = toolchain.npmPackages.join(' ');
      await this.runCommand(containerId, `npm install -g ${pkgList}`);
    }

    // 3. Python Packages
    if (toolchain.pythonPackages.length > 0) {
      const pkgList = toolchain.pythonPackages.join(' ');
      await this.runCommand(containerId, `pip install ${pkgList}`);
    }

    // 4. Custom Setup
    if (toolchain.customSetup) {
      await this.runCommand(containerId, toolchain.customSetup);
    }
  }

  private async runCommand(containerId: string, cmd: string): Promise<void> {
    try {
      await this.runtime.exec(containerId, cmd, false);
    } catch (error) {
      console.error(`Command failed: ${cmd}`, error);
      throw error;
    }
  }
}
