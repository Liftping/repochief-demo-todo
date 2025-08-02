# RepoChief TODO Demo - Execution Guide

This guide provides step-by-step instructions for running the RepoChief TODO app demonstration.

## Prerequisites

1. **System Requirements**
   - Node.js 18+ 
   - tmux (for agent visualization)
   - 8GB RAM minimum
   - Unix-based OS (macOS/Linux)

2. **API Keys** (for real mode only)
   ```bash
   export OPENAI_API_KEY=sk-...
   export ANTHROPIC_API_KEY=sk-ant-...
   ```

3. **Installation**
   ```bash
   cd packages/repochief-demo-todo
   npm install
   ```

## Quick Start

### Mock Mode (Recommended for first run)
```bash
npm run demo:mock
```

This runs the demo with simulated AI responses - no API costs, instant results.

### Real AI Mode
```bash
npm run demo:real
```

Uses actual AI models. Costs approximately:
- Basic scenario: $0.50-$1.00
- Full stack: $1.50-$3.00
- Enterprise: $3.00-$5.00

### Interactive Mode
```bash
npm run demo
```

Guides you through configuration options.

## Execution Flow

### 1. Initialization Phase (30s)
- Orchestrator setup
- Agent creation
- Dashboard startup
- Task queueing

### 2. Execution Phase (5-15 min)
- **Comprehension** (1-2 min): Requirements analysis
- **Generation** (3-5 min): Code creation
- **Testing** (2-3 min): Test suite generation
- **Validation** (1-2 min): Quality checks
- **Frontend** (3-5 min): UI generation (if applicable)

### 3. Completion Phase (30s)
- Result compilation
- Report generation
- Artifact organization

## Monitoring Progress

### Terminal Output
Watch the main terminal for:
- Task status updates
- Quality gate results
- Cost tracking (real mode)
- Error messages

### Web Dashboard
Open http://localhost:3456/dashboard to see:
- Real-time agent activity
- Task dependency graph
- Token usage meters
- Cost breakdown

### tmux Session
For detailed agent views:
```bash
tmux attach -t todo-demo-basic
```

Navigate between windows:
- `Ctrl+B` then `0-5`: Switch to agent windows
- `Ctrl+B` then `d`: Detach from session

## Scenarios

### Basic TODO API
- 3 agents (Analyst, Developer, Tester)
- In-memory storage
- REST endpoints
- Mocha tests

### Full Stack TODO App
- 5 agents (+ Reviewer, Frontend Dev)
- API + React frontend
- Quality validation
- ESLint + complexity checks

### Enterprise TODO App
- 5 agents with advanced models
- PostgreSQL database
- JWT authentication
- Docker containerization
- Production-ready code

## Output Structure

After successful execution:

```
.repochief/artifacts/
├── comprehend-todo-api/
│   ├── analysis.md          # Requirements document
│   └── metadata.json        # Task metadata
├── generate-todo-api/
│   ├── src/
│   │   ├── app.js          # Express application
│   │   ├── routes/         # API routes
│   │   │   └── todos.js
│   │   ├── models/         # Data models
│   │   │   └── todo.js
│   │   └── middleware/     # Custom middleware
│   ├── package.json
│   └── README.md
├── test-todo-api/
│   ├── test/
│   │   ├── unit/          # Unit tests
│   │   └── integration/   # Integration tests
│   └── package.json
├── validate-todo-api/       # (Full stack/Enterprise only)
│   ├── report.md          # Quality report
│   └── issues.json        # Found issues
└── generate-todo-frontend/  # (Full stack/Enterprise only)
    ├── src/
    │   ├── components/    # React components
    │   ├── hooks/         # Custom hooks
    │   └── App.jsx
    ├── package.json
    └── README.md
```

## Running the Generated Code

### Backend API
```bash
cd .repochief/artifacts/generate-todo-api
npm install
npm start
# API runs on http://localhost:3000
```

### Frontend (if generated)
```bash
cd .repochief/artifacts/generate-todo-frontend
npm install
npm start
# Frontend runs on http://localhost:3001
```

### Running Tests
```bash
cd .repochief/artifacts/test-todo-api
npm install
npm test
```

## Troubleshooting

### "No API key found"
Ensure environment variables are set:
```bash
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY
```

### "Budget exceeded"
Increase the budget limit:
```bash
DEMO_BUDGET=20 npm run demo:real
```

### "Quality gate failed"
This is normal - AI-generated code may have linting issues. Check:
- `.repochief/artifacts/validate-todo-api/report.md`
- Run `npm run lint:fix` in the generated code directory

### "tmux session not found"
The tmux session is only created in real mode. In mock mode, agents run in-process.

### Dashboard not loading
1. Check if port 3456 is in use: `lsof -i :3456`
2. Try a different port: `DASHBOARD_PORT=3457 npm run demo`

## Recording a Demo

To create a video demonstration:

```bash
npm run demo:record
```

This will:
1. Set up terminal recording with asciinema
2. Run the demo with visual enhancements
3. Save the recording for upload/conversion

## Advanced Configuration

### Custom Agent Models
Edit `scenarios/config.json` to change:
- Model assignments
- Token limits
- Timeout values
- Quality gate thresholds

### Environment Variables
```bash
DEMO_SCENARIO=enterprise    # basic, fullstack, enterprise
MOCK_MODE=false            # true/false
DEMO_BUDGET=15             # USD limit
DASHBOARD_PORT=3456        # Web UI port
LOG_LEVEL=debug           # error, warn, info, debug
```

### Programmatic Usage
```javascript
const { runDemo } = require('@liftping/repochief-demo-todo');

await runDemo({
    scenario: 'fullstack',
    mockMode: false,
    budget: 10
});
```

## Best Practices

1. **Start with Mock Mode**: Understand the flow before using real AI
2. **Monitor Costs**: Watch the cost meter in real mode
3. **Use tmux**: Better visibility into agent activities
4. **Review Output**: Check generated code quality before use
5. **Iterate**: Run multiple times to see variation in AI outputs

## Support

- GitHub Issues: [github.com/liftping/repochief](https://github.com/liftping/repochief)
- Documentation: [docs.repochief.ai](https://docs.repochief.ai)
- Discord: [discord.gg/repochief](https://discord.gg/repochief)