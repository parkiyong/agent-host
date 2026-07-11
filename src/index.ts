import { RuntimeManager } from './runtimes/runtime-manager';
import { WorkflowManager, Workflow } from './workflow/manager';
import { Provisioner } from './workflow/provisioner';
import { AgentSession } from './workflow/session';
import { PtyBridge } from './pty-bridge';
import { PersistenceManager } from './persistence/manager';
import { ContainerConfig } from './runtimes/types';
import { NetworkConfig } from './workflow/network';

export class AgentHost {
  constructor(
    private runtimeManager: RuntimeManager,
    private workflowManager: WorkflowManager,
    private ptyBridge: PtyBridge,
    private persistenceManager: PersistenceManager
  ) {}

  async launchAgent(
    manifestJson: string, 
    runtimeType: any, 
    agentId: string,
    networkConfig?: NetworkConfig
  ): Promise<AgentSession> {
    const workflow = this.workflowManager.parse(manifestJson);
    const provider = this.runtimeManager.getProvider(runtimeType);

    // 1. Persistence Setup
    await this.persistenceManager.ensureProjectDir(agentId);
    await this.persistenceManager.ensureEnvVolume(provider, agentId);
    
    const projectMount = this.persistenceManager.getProjectMount(agentId);
    const envMount = this.persistenceManager.getEnvMount(agentId);

    // 2. Configure Container
    const config: ContainerConfig = {
      image: workflow.image,
      env: { 
        ...workflow.env, 
        AGENT_TYPE: workflow.agent,
        AGENT_ID: agentId
      },
      mounts: [
        projectMount,
        envMount
      ],
      cpuLimit: 2,
      memLimit: 4096,
    };

    // 3. Container Lifecycle
    const containerId = await provider.createContainer(config);
    await provider.startContainer(containerId);

    // 4. Tooling Provisioning with Network Config
    const provisioner = new Provisioner(provider);
    await provisioner.provision(containerId, workflow.toolchain, networkConfig);

    // 5. Start Session
    const session = new AgentSession(provider, this.ptyBridge, containerId, workflow);
    await session.start();

    return session;
  }
}
