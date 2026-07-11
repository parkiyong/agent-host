import { RuntimeProvider } from '../runtimes/types';
import * as fs from 'fs';
import * as path from 'path';

export class PersistenceManager {
  constructor(private hostRoot: string) {}

  getProjectMount(agentId: string): { source: string, target: string } {
    return {
      source: path.join(this.hostRoot, 'workspaces', agentId),
      target: '/workspace'
    };
  }

  getEnvMount(agentId: string): { source: string, target: string } {
    return {
      source: `agent-env-${agentId}`,
      target: '/home/agent'
    };
  }

  async ensureProjectDir(agentId: string): Promise<void> {
    const p = path.join(this.hostRoot, 'workspaces', agentId);
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p, { recursive: true });
    }
  }

  async ensureEnvVolume(runtime: RuntimeProvider, agentId: string): Promise<void> {
    // For Docker/Podman, we rely on the runtime to create the named volume automatically
    // For Firecracker, this would be where we create the block device image
    if (runtime.name === 'firecracker') {
      console.log(`Creating block device for agent ${agentId}...`);
      // logic to create a raw disk image
    }
  }
}
