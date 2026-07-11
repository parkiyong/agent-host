import { RuntimeProvider } from '../runtimes/types';
import { Workflow } from './manager';
import { PtyBridge } from '../pty-bridge';

export class AgentSession {
  public containerId: string;
  private ptyProcess: any;

  constructor(
    private runtime: RuntimeProvider,
    private ptyBridge: PtyBridge,
    containerId: string,
    private workflow: Workflow
  ) {
    this.containerId = containerId;
  }

  async start(): Promise<void> {
    const cmd = this.workflow.entrypoint || this.getDefaultEntrypoint();
    this.ptyProcess = await this.ptyBridge.connect(this.containerId, cmd);
    
    console.log(`Agent session started for ${this.workflow.name} in ${this.containerId}`);
  }

  private getDefaultEntrypoint(): string {
    return this.workflow.agent === 'cursor' ? 'cursor-agent' : 'claude';
  }

  async stop(): Promise<void> {
    if (this.ptyProcess) {
      this.ptyProcess.kill();
    }
    await this.runtime.stopContainer(this.containerId);
  }

  async sendInput(data: string): Promise<void> {
    if (this.ptyProcess) {
      this.ptyProcess.write(data + '\n');
    }
  }
}
