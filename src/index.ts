import { RuntimeManager } from './runtimes/runtime-manager';
import { WorkflowManager } from './workflow/manager';
import { Provisioner } from './workflow/provisioner';
import { AgentSession } from './workflow/session';
import { PtyBridge } from './pty-bridge';
import { ContainerConfig } from './runtimes/types';

export class AgentHost {
  constructor(
    private runtimeManager: RuntimeManager,
    private workflowManager: WorkflowManager,
    private ptyBridge: PtyBridge
  ) {}

  async launchAgent(manifestJson: string, runtimeType: any, workspacePath: string): Promise<AgentSession> {
    // 1. Parse Workflow
    const workflow = this.workflowManager.parse(manifestJson);
    const provider = this.runtimeManager.getProvider(runtimeType);

    // 2. Configure Container
    const config: ContainerConfig = {
      image: workflow.image,
      env: { 
        ...workflow.env, 
        AGENT_TYPE: workflow.agent 
      },
      mounts: [
        { source: workspacePath, target: '/workspace' },
        { source: `agent-home-${workflow.agent}`, target: '/home/agent' }
      ],
      cpuLimit: 2,
      memLimit: 4096,
    };

    // 3. Container Lifecycle
    const containerId = await provider.createContainer(config);
    await provider.startContainer(containerId);

    // 4. Tooling Provisioning
    const provisioner = new Provisioner(provider);
    await provisioner.provision(containerId, workflow.toolchain);

    // 5. Start Session
    const session = new AgentSession(provider, this.ptyBridge, containerId, workflow);
    await session.start();

    return session;
  }
}
