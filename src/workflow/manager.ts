import { z } from 'zod';

export const ToolchainSchema = z.object({
  systemPackages: z.array(z.string()).default([]),
  npmPackages: z.array(z.string()).default([]),
  pythonPackages: z.array(z.string()).default([]),
  customSetup: z.string().optional(),
});

export const WorkflowSchema = z.object({
  name: z.string(),
  agent: z.enum(['cursor', 'claude']),
  image: z.string().default('ubuntu:latest'),
  toolchain: ToolchainSchema,
  env: z.record(z.string()).optional(),
  entrypoint: z.string().optional(),
});

export type Toolchain = z.infer<typeof ToolchainSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;

export class WorkflowManager {
  parse(manifest: string): Workflow {
    return WorkflowSchema.parse(JSON.parse(manifest));
  }
}
