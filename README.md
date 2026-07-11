# 🤖 AI Agent Container Host

A pluggable orchestration system designed to host autonomous AI agents (like Cursor Agent CLI and Claude Code) in secure, isolated environments.

## 🌟 What is this?

This tool allows you to run powerful AI coding agents inside containers. This means the agents can read your code, run tests, and install dependencies without risking your host machine's stability or security.

It is **pluggable**, meaning you can choose:
- **Which Agent to use**: Cursor Agent CLI or Claude Code.
- **Which Isolation to use**: Docker, Podman, or Firecracker (MicroVMs).
- **Which Workflow to run**: Define exactly what tools (Node, Python, Git) the agent needs via a simple manifest.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Before running this host, ensure you have one of these installed on your machine:
- [Docker](https://docs.docker.com/get-docker/) (Most common)
- [Podman](https://podman.io/) (Rootless alternative)
- [Firecracker](https://firecracker-microvm.github.io/) (For high-security microVMs)

### 2. Setup
1. **Clone the repo** and enter the directory.
2. **Install dependencies**:
   ```bash
   npm install
   ```

### 3. Launching an Agent
The host uses a **Workflow Manifest** (a JSON file) to decide how to set up your agent.

**Example Manifest (`my-workflow.json`):**
```json
{
  "name": "full-stack-dev",
  "agent": "claude",
  "image": "ubuntu:latest",
  "toolchain": {
    "systemPackages": ["curl", "git"],
    "npmPackages": ["typescript"],
    "pythonPackages": ["requests"]
  },
  "env": {
    "CLAUDE_API_KEY": "your-key-here"
  }
}
```

**Run the host**:
(The current implementation is a library; use the provided `cli.ts` or integrate it into your app).

---

## 🛠 How it Works (The "Simple" Version)

1. **The Map**: We decided on a "Dual-Layer" approach for your files:
   - **Project Layer**: Your actual code is synced in real-time. If the agent changes a file, you see it instantly.
   - **Environment Layer**: The agent's "brain" (caches, configs, plugins) is saved in a separate volume so it doesn't forget things when the container restarts.
2. **The Bridge**: Since these AI agents are "interactive" (they ask questions and show progress bars), we use a **PTY Bridge**. This tricks the agent into thinking it's in a real terminal, allowing it to function normally.
3. **The Provisioner**: When you start a session, the host automatically installs the tools you asked for in the manifest before handing control to the agent.

## 🔒 Security
- **Isolation**: By using Firecracker or Podman, the agent is trapped in a sandbox.
- **Privileges**: Agents run as non-root users by default to prevent system-level damage.
