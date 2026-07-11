import { AgentHost } from './src/index';
import { RuntimeManager } from './src/runtimes/runtime-manager';
import { DockerProvider } from './src/runtimes/docker';
import { WorkflowManager } from './src/workflow/manager';
import { PtyBridge } from './src/pty-bridge';
import * as fs from 'fs';

async function main() {
  const runtimeManager = new RuntimeManager();
  runtimeManager.registerProvider(new DockerProvider());

  const workflowManager = new WorkflowManager();
  const ptyBridge = new PtyBridge();
  const host = new AgentHost(runtimeManager, workflowManager, ptyBridge);

  const manifest = {
    name: "test-sdlc-workflow",
    agent: "claude",
    image: "ubuntu:latest",
    toolchain: {
      systemPackages: ["curl", "git"],
      npmPackages: ["typescript"],
      pythonPackages: ["requests"]
    },
    env: { "DEBUG": "true" }
  };

  const workspace = process.cwd() + '/test-workspace';
  if (!fs.existsSync(workspace)) fs.mkdirSync(workspace);

  console.log("Launching agent session...");
  try {
    const session = await host.launchAgent(
      JSON.stringify(manifest),
      'docker',
      workspace
    );
    console.log("Session active. Container ID:", session.containerId);
    
    // Simple test: send a command to the agent
    await session.sendInput('ls -la');
    
    process.on('SIGINT', async () => {
      await session.stop();
      process.exit();
    });
  } catch (e) {
    console.error("Launch failed:", e);
  }
}

main();
