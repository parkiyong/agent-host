import { RuntimeProvider } from '../runtimes/types';
import { Workflow, Toolchain } from './manager';
import { NetworkConfig } from './network';

export class Provisioner {
  constructor(private runtime: RuntimeProvider) {}

  async provision(containerId: string, toolchain: Toolchain, network?: NetworkConfig): Promise<void> {
    console.log(`Provisioning toolchain for container ${containerId}...`);

    if (network?.proxyServer) {
      await this.runCommand(containerId, `export http_proxy=${network.proxyServer} && export https_proxy=${network.proxyServer}`);
    }

    if (toolchain.systemPackages.length > 0) {
      const pkgList = toolchain.systemPackages.join(' ');
      await this.runCommand(containerId, `apt-get update && apt-get install -y ${pkgList}`);
    }

    if (toolchain.npmPackages.length > 0) {
      const pkgList = toolchain.npmPackages.join(' ');
      await this.runCommand(containerId, `npm install -g ${pkgList}`);
    }

    if (toolchain.pythonPackages.length > 0) {
      const pkgList = toolchain.pythonPackages.join(' ');
      await this.runCommand(containerId, `pip install ${pkgList}`);
    }

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
