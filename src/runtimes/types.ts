export type RuntimeType = 'docker' | 'podman' | 'firecracker';

export interface ContainerConfig {
  image: string;
  env: Record<string, string>;
  mounts: Array<{
    source: string;
    target: string;
    readonly?: boolean;
  }>;
  cpuLimit: number;
  memLimit: number;
}

export interface RuntimeProvider {
  name: RuntimeType;
  createContainer(config: ContainerConfig): Promise<string>; // returns containerId
  startContainer(containerId: string): Promise<void>;
  stopContainer(containerId: string): Promise<void>;
  removeContainer(containerId: string): Promise<void>;
  exec(containerId: string, cmd: string, pty: boolean): Promise<any>; // Simplified for now
}
