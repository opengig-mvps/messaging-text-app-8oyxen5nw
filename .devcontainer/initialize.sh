#!/bin/bash

# Install project dependencies
npm install

# Create necessary directories
# mkdir -p /home/node/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings
mkdir -p /home/node/.vscode-remote/data/User/globalStorage/saoudrizwan.claude-dev/settings

# Setup user-stories server
if [ -d "/workspaces/dev-container/user-stories-server" ]; then
    # Build the project
    cd /workspaces/dev-container/user-stories-server
    npm install
    npm run build
    
    # Start the server in a new terminal
    mkdir -p /workspaces/dev-container/.vscode
    cat > /workspaces/dev-container/.vscode/tasks.json << 'EOF'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start User Stories Server",
      "type": "shell",
      "command": "cd /workspaces/dev-container/user-stories-server && node build/index.js",
      "isBackground": true,
      "problemMatcher": {
        "pattern": {
          "regexp": "^.*$",
          "file": 1,
          "location": 2,
          "message": 3
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "^.*Server starting.*$",
          "endsPattern": "^.*Server started.*$"
        }
      },
      "presentation": {
        "reveal": "always",
        "panel": "new",
        "group": "servers"
      }
    }
  ]
}
EOF

    # Create MCP settings file
    cat > /home/node/.vscode-remote/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json <<EOF
{
  "mcpServers": {
    "user-stories": {
      "command": "node",
      "args": ["/workspaces/dev-container/user-stories-server/build/index.js"],
      "env": {}
    }
  }
}
EOF

    # Set proper permissions
    chmod 644 /home/node/.vscode-remote/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
    
    # Start the server automatically
    nohup node /workspaces/dev-container/user-stories-server/build/index.js
    
    echo "User Stories server started. Check logs at /home/codespace/user-stories.log"
fi