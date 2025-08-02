# RepoChief TODO App Demo

This package contains the official demonstration scenario for RepoChief, showcasing how a swarm of 3-5 AI agents can collaboratively build a complete TODO application with REST API, tests, and frontend.

## Overview

The demo orchestrates the following agents:
1. **Requirements Analyst** - Comprehends and analyzes the TODO app requirements
2. **Backend Developer** - Generates the REST API implementation
3. **Test Engineer** - Creates comprehensive test suites
4. **Quality Validator** - Reviews code quality and security
5. **Frontend Developer** - Builds a React-based UI (optional)

## Quick Start

```bash
# Run in mock mode (no AI costs)
npm run demo:mock

# Run with real AI models (requires API keys)
npm run demo:real

# Interactive mode - choose your configuration
npm run demo
```

## Features Demonstrated

- **Multi-Agent Orchestration**: 5 specialized agents working in parallel
- **Task Dependencies**: Smart DAG-based execution flow
- **Quality Gates**: Automated ESLint, test runner, and complexity checks
- **Cost Tracking**: Real-time token usage and cost monitoring
- **Progress Visualization**: Live dashboard and terminal updates
- **Artifact Generation**: Complete working code output

## Demo Scenarios

### Scenario 1: Basic TODO API (3 agents)
- Requirements analysis
- REST API generation
- Test suite creation

### Scenario 2: Full Stack TODO App (5 agents)
- All of Scenario 1, plus:
- Code quality validation
- React frontend generation

### Scenario 3: Enterprise TODO App (5 agents)
- All of Scenario 2, plus:
- Authentication & authorization
- Database integration
- Docker containerization

## Configuration

### Environment Variables
```bash
# AI Model API Keys
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Demo Settings
MOCK_MODE=true          # Use mock responses (no API calls)
DEMO_BUDGET=10          # Maximum budget in USD
DEMO_SCENARIO=basic     # basic, fullstack, or enterprise
```

### Custom Configuration
Edit `scenarios/config.json` to customize:
- Agent models and roles
- Task specifications
- Quality gate thresholds
- Output preferences

## Output Structure

```
.repochief/artifacts/
├── comprehend-todo-api/
│   └── analysis.md
├── generate-todo-api/
│   ├── src/
│   │   ├── app.js
│   │   ├── routes/
│   │   └── models/
│   └── package.json
├── test-todo-api/
│   └── test/
│       ├── unit/
│       └── integration/
├── validate-todo-api/
│   └── report.md
└── generate-todo-frontend/
    ├── src/
    │   ├── components/
    │   └── App.jsx
    └── package.json
```

## Recording a Demo

```bash
# Start recording (opens tmux session)
npm run demo:record

# The script will:
# 1. Set up screen recording
# 2. Run the demo with visual enhancements
# 3. Capture all agent activities
# 4. Generate a video file
```

## Integration with RepoChief CLI

```bash
# Using the CLI
repochief demo todo --agents 5 --budget 10

# With specific scenario
repochief demo todo --scenario enterprise --real-mode
```

## Development

### Adding New Scenarios
1. Create a new file in `scenarios/`
2. Define agent configurations and tasks
3. Add to scenario loader in `src/scenarios.js`

### Customizing Agents
Edit `src/agents/` to modify agent behaviors, models, or prompts.

### Testing
```bash
npm test
```

## Troubleshooting

### Common Issues

1. **"No API key found"**
   - Ensure environment variables are set
   - Check `.env` file in project root

2. **"Budget exceeded"**
   - Increase DEMO_BUDGET value
   - Use mock mode for testing

3. **"Quality gate failed"**
   - Review generated code
   - Adjust quality thresholds in config

## Learn More

- [RepoChief Documentation](https://github.com/liftping/repochief)
- [API Reference](../repochief-core/README.md)
- [Quality Gates Guide](../repochief-quality-gates/README.md)