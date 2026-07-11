import { exec } from 'child_process';
import { promisify } from 'util';
import pty from 'node-pty';

const execAsync = promisify(exec);

export class PtyBridge {
  async connect(containerId: string, cmd: string): Promise<any> {
    // ponytail: using docker exec with pty directly for now
    return pty.spawn('docker', ['exec', '-it', containerId, 'bash', '-c', cmd], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: process.cwd(),
      env: process.env
    });
  }
}
