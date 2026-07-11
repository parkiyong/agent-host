import { RuntimeProvider, RuntimeType, ContainerConfig } from './types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class DockerProvider implements RuntimeProvider {
  name: RuntimeType = 'docker';

  async createContainer(config: ContainerConfig): Promise<string> {
    const envFlags = Object.entries(config.env)
      .map(([k, v]) => `-e ${k}="${v}"`)
      .join(' ');
    
    const mountFlags = config.mounts
      .map(m => `-v ${m.source}:${m.target}${m.readonly ? ':ro' la : ''}`)
      .join(' ');

    const { stdout } = await execAsync(
      `docker create ${mountFlags} ${envFlags} ${config.image}`
    );
    return stdout.trim();
  }

  async startContainer(containerId: string): Promise<void> {
    await execAsync(`docker start ${containerId}`);
  }

  async stopContainer(containerId: string): Promise<void> {
    await execAsync(`docker stop ${containerId}`);
  }

  async removeContainer(containerId: string): Promise<void> {
    await execAsync(`docker rm -f ${containerId}`);
  }

  async exec(containerId: string, cmd: string, pty: boolean): Promise<any> {
    // Implementation using node-pty for real interactive sessions
    // For the skeleton, we use a simple exec
    const { stdout } = await execAsync(`docker exec -it ${containerId} ${cmd}`);
    return stdout;
  }
}
