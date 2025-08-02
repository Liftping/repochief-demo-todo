/**
 * RepoChief TODO App Demo Runner
 * Enhanced version with real AI support and better visualization
 */

require('dotenv').config();
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { 
    createOrchestrator, 
    createCloudAPI,
    AgentTemplates 
} = require('@liftping/repochief-core');

// Demo configuration
const SCENARIOS = {
    basic: {
        name: 'Basic TODO API',
        agents: 3,
        description: 'REST API with tests'
    },
    fullstack: {
        name: 'Full Stack TODO App',
        agents: 5,
        description: 'API + Frontend + Quality validation'
    },
    enterprise: {
        name: 'Enterprise TODO App',
        agents: 5,
        description: 'Full app with auth, DB, and Docker'
    }
};

class TodoDemoRunner {
    constructor(options = {}) {
        this.scenario = options.scenario || 'basic';
        this.mockMode = options.mockMode !== undefined ? options.mockMode : true;
        this.budget = options.budget || 10;
        this.verbose = options.verbose || false;
        this.orchestrator = null;
        this.api = null;
        this.agents = {};
    }
    
    async run() {
        console.log(chalk.bold.cyan('\n🚀 RepoChief TODO App Demo\n'));
        
        // Interactive setup if no options provided and not in non-interactive mode
        if (process.argv.length <= 2 && !process.argv.includes('--non-interactive')) {
            await this.interactiveSetup();
        }
        
        // Display configuration
        this.displayConfig();
        
        try {
            // Initialize components
            await this.initialize();
            
            // Create agent swarm
            await this.createAgents();
            
            // Queue tasks
            await this.queueTasks();
            
            // Start execution
            await this.execute();
            
            // Display results
            this.displayResults();
            
            // Clean shutdown
            await this.cleanup();
            
        } catch (error) {
            console.error(chalk.red('\n❌ Demo failed:'), error.message);
            if (this.verbose) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    }
    
    async interactiveSetup() {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'scenario',
                message: 'Select demo scenario:',
                choices: Object.entries(SCENARIOS).map(([key, val]) => ({
                    name: `${val.name} - ${val.description}`,
                    value: key
                }))
            },
            {
                type: 'confirm',
                name: 'mockMode',
                message: 'Use mock mode? (no API calls, no costs)',
                default: true
            },
            {
                type: 'number',
                name: 'budget',
                message: 'Set budget limit (USD):',
                default: 10,
                when: (answers) => !answers.mockMode
            }
        ]);
        
        this.scenario = answers.scenario;
        this.mockMode = answers.mockMode;
        this.budget = answers.budget || 10;
    }
    
    displayConfig() {
        const config = SCENARIOS[this.scenario];
        console.log(chalk.yellow('Configuration:'));
        console.log(`  Scenario: ${chalk.bold(config.name)}`);
        console.log(`  Agents: ${chalk.bold(config.agents)}`);
        console.log(`  Mode: ${chalk.bold(this.mockMode ? 'Mock' : 'Real AI')}`);
        console.log(`  Budget: ${chalk.bold('$' + this.budget)}`);
        console.log();
    }
    
    async initialize() {
        const spinner = ora('Initializing orchestrator...').start();
        
        // Create orchestrator
        this.orchestrator = createOrchestrator({
            sessionName: `todo-demo-${this.scenario}`,
            totalBudget: this.budget,
            mockMode: this.mockMode
        });
        
        await this.orchestrator.initialize();
        spinner.succeed('Orchestrator initialized');
        
        // Start cloud API
        spinner.start('Starting dashboard...');
        this.api = createCloudAPI({
            port: 3456,
            apiKey: process.env.REPOCHIEF_API_KEY || 'demo-key-12345'
        });
        
        await this.api.start();
        spinner.succeed('Dashboard started');
        console.log(chalk.dim(`  View at: http://localhost:3456/dashboard\n`));
    }
    
    async createAgents() {
        console.log(chalk.yellow('Creating AI agent swarm...'));
        
        // Always create these 3 core agents
        this.agents.analyst = await this.createAgent('Alice-Analyst', AgentTemplates.REQUIREMENTS_ANALYST);
        this.agents.developer = await this.createAgent('Bob-Developer', AgentTemplates.SENIOR_DEVELOPER);
        this.agents.tester = await this.createAgent('Carol-QA', AgentTemplates.QA_ENGINEER);
        
        // Additional agents for fullstack/enterprise scenarios
        if (this.scenario !== 'basic') {
            this.agents.reviewer = await this.createAgent('David-Reviewer', AgentTemplates.CODE_REVIEWER);
            this.agents.frontend = await this.createAgent('Eve-Frontend', {
                role: 'frontend_developer',
                model: 'gpt-4o',
                capabilities: ['generation', 'refactoring'],
                constraints: {
                    maxContextTokens: 100000,
                    temperature: 0.7,
                    preferredFrameworks: ['React', 'Next.js', 'TypeScript']
                }
            });
        }
        
        console.log();
    }
    
    async createAgent(name, template) {
        const agent = await this.orchestrator.createAgent({
            name,
            ...template,
            maxConcurrentTasks: 2
        });
        console.log(chalk.green(`  ✓ Created ${agent.name} (${agent.role})`));
        return agent;
    }
    
    async queueTasks() {
        console.log(chalk.yellow('Queueing development tasks...'));
        
        // Task 1: Comprehend requirements
        await this.queueTask({
            id: 'comprehend-todo-api',
            type: 'comprehension',
            objective: 'Analyze requirements for a RESTful TODO API',
            description: this.getRequirementsDescription(),
            maxTokens: 10000,
            agentId: this.agents.analyst.id
        });
        
        // Task 2: Generate API
        await this.queueTask({
            id: 'generate-todo-api',
            type: 'generation',
            objective: 'Implement TODO API with Express.js',
            dependencies: ['comprehend-todo-api'],
            context: ['.repochief/artifacts/comprehend-todo-api/analysis.md'],
            successCriteria: this.getApiSuccessCriteria(),
            maxTokens: 50000,
            agentId: this.agents.developer.id
        });
        
        // Task 3: Create tests
        await this.queueTask({
            id: 'test-todo-api',
            type: 'generation',
            objective: 'Write comprehensive tests for TODO API',
            dependencies: ['generate-todo-api'],
            context: ['.repochief/artifacts/generate-todo-api/code/'],
            successCriteria: [
                'Unit tests for all endpoints',
                'Test coverage > 80%',
                'Mock dependencies properly',
                'Test error cases and edge cases',
                'Use Mocha + Chai + Sinon'
            ],
            maxTokens: 30000,
            agentId: this.agents.tester.id
        });
        
        // Additional tasks for non-basic scenarios
        if (this.scenario !== 'basic') {
            // Task 4: Validate quality
            await this.queueTask({
                id: 'validate-todo-api',
                type: 'validation',
                objective: 'Review code quality and security',
                dependencies: ['generate-todo-api', 'test-todo-api'],
                context: [
                    '.repochief/artifacts/generate-todo-api/code/',
                    '.repochief/artifacts/test-todo-api/code/'
                ],
                specificChecks: [
                    'Code follows best practices',
                    'No security vulnerabilities',
                    'Proper input validation',
                    'Good error handling',
                    'Clean code structure'
                ],
                qualityGates: ['eslint', 'test', 'complexity'],
                maxTokens: 20000,
                agentId: this.agents.reviewer.id
            });
            
            // Task 5: Generate frontend
            await this.queueTask({
                id: 'generate-todo-frontend',
                type: 'generation',
                objective: 'Create React frontend for TODO app',
                dependencies: ['generate-todo-api'],
                context: ['.repochief/artifacts/generate-todo-api/api-spec.json'],
                successCriteria: [
                    'React functional components with hooks',
                    'Responsive design with Tailwind CSS',
                    'API integration with fetch/axios',
                    'Error handling and loading states',
                    'Add, edit, delete, and complete todos'
                ],
                maxTokens: 40000,
                agentId: this.agents.frontend.id
            });
        }
        
        console.log();
    }
    
    async queueTask(taskSpec) {
        const task = await this.orchestrator.queueTask(taskSpec);
        console.log(chalk.green(`  ✓ Queued: ${task.objective}`));
        return task;
    }
    
    getRequirementsDescription() {
        const base = `Understand the requirements for a TODO API with the following features:
            - CRUD operations (Create, Read, Update, Delete)
            - Task model with: id, title, description, completed, createdAt, updatedAt
            - RESTful endpoints following best practices
            - Input validation
            - Error handling
            - JSON responses`;
            
        if (this.scenario === 'enterprise') {
            return base + `
            - JWT authentication
            - User association (tasks belong to users)
            - PostgreSQL database integration
            - Docker containerization
            - Rate limiting and security headers`;
        }
        
        return base;
    }
    
    getApiSuccessCriteria() {
        const base = [
            'Express.js REST API implementation',
            'All CRUD endpoints (GET, POST, PUT, DELETE)',
            'Proper error handling and validation',
            'Clean code structure with router separation'
        ];
        
        if (this.scenario === 'basic') {
            base.push('In-memory storage for demo purposes');
        } else if (this.scenario === 'enterprise') {
            base.push('PostgreSQL integration with migrations');
            base.push('JWT authentication middleware');
            base.push('User-scoped todo operations');
        }
        
        return base;
    }
    
    async execute() {
        console.log(chalk.yellow('Starting execution...\n'));
        
        // Set up event handlers
        this.setupEventHandlers();
        
        // Start execution
        await this.orchestrator.startExecution();
        
        // Show progress hint
        if (!this.mockMode) {
            console.log(chalk.dim('💡 Tip: Run "tmux attach -t ' + 
                `todo-demo-${this.scenario}" to see agents in action\n`));
        }
        
        // Wait for completion
        console.log(chalk.yellow('Waiting for completion...'));
        await this.orchestrator.waitForCompletion();
        console.log(chalk.green('All tasks completed!'));
    }
    
    setupEventHandlers() {
        this.orchestrator.on('taskStarted', ({ task, agent }) => {
            console.log(chalk.blue(`🔄 Started: ${task.objective} (${agent.name})`));
        });
        
        this.orchestrator.on('taskProgress', ({ task, progress }) => {
            // Only show progress updates in verbose mode
            if (this.verbose) {
                console.log(chalk.dim(`   Progress: ${Math.round(progress * 100)}%`));
            }
        });
        
        this.orchestrator.on('taskCompleted', ({ task, result }) => {
            console.log(chalk.green(`✅ Completed: ${task.objective}`));
            if (result.artifacts) {
                console.log(chalk.dim(`   📁 Artifacts: ${result.artifacts.path}`));
            }
        });
        
        this.orchestrator.on('taskFailed', ({ task, error }) => {
            console.error(chalk.red(`❌ Failed: ${task.objective}`));
            console.error(chalk.red(`   Error: ${error.message}`));
        });
        
        this.orchestrator.on('qualityGateResult', ({ gate, result }) => {
            const icon = result.status === 'pass' ? '✅' : '❌';
            const color = result.status === 'pass' ? 'green' : 'red';
            console.log(chalk[color](`   ${icon} Quality Gate: ${gate} - ${result.status}`));
        });
        
        if (!this.mockMode) {
            this.orchestrator.on('costUpdate', ({ cost, total }) => {
                console.log(chalk.yellow(`💰 Cost: +$${cost.toFixed(3)} (Total: $${total.toFixed(3)})`));
            });
        }
    }
    
    displayResults() {
        const report = this.orchestrator.getFinalReport();
        
        console.log(chalk.bold.cyan('\n📊 Final Report\n'));
        
        // Success status
        const success = report.tasksCompleted === report.totalTasks;
        const statusIcon = success ? '✅' : '❌';
        const statusColor = success ? 'green' : 'red';
        
        console.log(chalk[statusColor](`${statusIcon} Status: ${success ? 'SUCCESS' : 'FAILED'}`));
        console.log(`📋 Tasks: ${report.tasksCompleted}/${report.totalTasks} completed`);
        
        if (!this.mockMode) {
            console.log(`💰 Total Cost: $${report.totalCost.toFixed(2)}`);
            console.log(`🔤 Tokens Used: ${report.totalTokens.toLocaleString()}`);
        }
        
        console.log(`⏱  Duration: ${Math.round(report.duration / 1000)}s`);
        
        if (success) {
            console.log(chalk.bold.green('\n🎉 Success! TODO app has been generated.\n'));
            console.log('📁 Generated artifacts:');
            console.log('   .repochief/artifacts/comprehend-todo-api/    - Requirements analysis');
            console.log('   .repochief/artifacts/generate-todo-api/     - Backend API code');
            console.log('   .repochief/artifacts/test-todo-api/         - Test suite');
            
            if (this.scenario !== 'basic') {
                console.log('   .repochief/artifacts/validate-todo-api/     - Quality report');
                console.log('   .repochief/artifacts/generate-todo-frontend/ - React frontend');
            }
            
            console.log('\n🌐 Dashboard: http://localhost:3456/dashboard');
            console.log('\n💡 Next steps:');
            console.log('   1. cd .repochief/artifacts/generate-todo-api');
            console.log('   2. npm install');
            console.log('   3. npm start');
        }
        
        console.log(chalk.dim('\n📌 Press Ctrl+C to stop the demo and dashboard.\n'));
    }
    
    async cleanup() {
        try {
            // Shutdown orchestrator
            if (this.orchestrator) {
                await this.orchestrator.shutdown();
            }
            
            // Stop API server
            if (this.api && this.api.stop) {
                await this.api.stop();
            }
            
            // Exit cleanly
            setTimeout(() => {
                process.exit(0);
            }, 500);
        } catch (error) {
            console.error('Cleanup error:', error);
            process.exit(1);
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n👋 Shutting down RepoChief demo...'));
    process.exit(0);
});

// Parse command line options
const options = {
    scenario: process.env.DEMO_SCENARIO || 'basic',
    mockMode: process.env.MOCK_MODE === 'true',
    budget: parseInt(process.env.DEMO_BUDGET) || 10,
    verbose: process.argv.includes('--verbose')
};

// Run the demo
const runner = new TodoDemoRunner(options);
runner.run().catch(console.error);