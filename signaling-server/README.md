# CoFall Signaling Server

This directory is a placeholder for the signaling server. To set up:

## Option 1: Clone the signaling server repository

```bash
# Remove this placeholder directory
rm -rf signaling-server

# Clone the signaling server
git clone https://github.com/AnoRebel/cofall-signaling-server.git signaling-server

# Install dependencies
cd signaling-server && bun install
```

## Option 2: Use docker-compose to pull from remote

Update `docker-compose.yml` to build from the remote repository:

```yaml
signaling:
  build:
    context: https://github.com/AnoRebel/cofall-signaling-server.git#main
```

## Development

```bash
# Start the signaling server
cd signaling-server
bun run dev
```

## Environment Variables

See `.env.example` in the root directory for configuration options.
