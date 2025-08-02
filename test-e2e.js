/**
 * End-to-End Test for RepoChief TODO Demo
 * Tests the complete swarm execution with quality gates
 */

const { 
    createOrchestrator, 
    createCloudAPI,
    AgentTemplates 
} = require('@liftping/repochief-core');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

async function runE2ETest() {
    console.log(chalk.bold.cyan('\n🧪 RepoChief E2E Test - TODO App Demo\n'));
    
    let orchestrator = null;
    let api = null;
    
    try {
        // 1. Create orchestrator in mock mode
        console.log('1️⃣ Creating orchestrator...');
        orchestrator = createOrchestrator({
            sessionName: 'e2e-test-todo',
            totalBudget: 5,
            mockMode: true // Always use mock for tests
        });
        
        await orchestrator.initialize();
        console.log(chalk.green('✓ Orchestrator initialized'));
        
        // 2. Start cloud API (without keeping process alive)
        console.log('\n2️⃣ Starting Cloud API...');
        api = createCloudAPI({
            port: 3457, // Different port to avoid conflicts
            apiKey: 'test-key-12345'
        });
        
        await api.start();
        console.log(chalk.green('✓ Cloud API started on port 3457'));
        
        // 3. Create agents
        console.log('\n3️⃣ Creating agent swarm...');
        const agents = {
            analyst: await orchestrator.createAgent({
                name: 'Test-Analyst',
                ...AgentTemplates.REQUIREMENTS_ANALYST,
                maxConcurrentTasks: 1
            }),
            developer: await orchestrator.createAgent({
                name: 'Test-Developer',
                ...AgentTemplates.SENIOR_DEVELOPER,
                maxConcurrentTasks: 2
            }),
            tester: await orchestrator.createAgent({
                name: 'Test-QA',
                ...AgentTemplates.QA_ENGINEER,
                maxConcurrentTasks: 1
            })
        };
        console.log(chalk.green('✓ Created 3 agents'));
        
        // 4. Queue tasks
        console.log('\n4️⃣ Queueing tasks...');
        const tasks = [];
        
        tasks.push(await orchestrator.queueTask({
            id: 'e2e-comprehend',
            type: 'comprehension',
            objective: 'Analyze TODO API requirements',
            description: 'Simple TODO API with CRUD operations',
            maxTokens: 10000,
            agentId: agents.analyst.id
        }));
        
        tasks.push(await orchestrator.queueTask({
            id: 'e2e-generate',
            type: 'generation',
            objective: 'Generate TODO API code',
            dependencies: ['e2e-comprehend'],
            context: ['.repochief/artifacts/e2e-comprehend/analysis.md'],
            successCriteria: ['Express API', 'CRUD endpoints'],
            maxTokens: 20000,
            agentId: agents.developer.id,
            qualityGates: ['eslint', 'complexity'] // Test quality gates
        }));
        
        tasks.push(await orchestrator.queueTask({
            id: 'e2e-test',
            type: 'generation',
            objective: 'Generate tests',
            dependencies: ['e2e-generate'],
            context: ['.repochief/artifacts/e2e-generate/code/'],
            successCriteria: ['Unit tests', 'Test coverage'],
            maxTokens: 15000,
            agentId: agents.tester.id,
            qualityGates: ['test'] // Test the TestRunnerGate
        }));
        
        console.log(chalk.green(`✓ Queued ${tasks.length} tasks`));
        
        // 5. Track execution
        console.log('\n5️⃣ Starting execution...');
        let completedTasks = 0;
        let failedTasks = 0;
        const qualityGateResults = [];
        
        orchestrator.on('taskCompleted', ({ task }) => {
            completedTasks++;
            console.log(chalk.green(`✓ Completed: ${task.objective}`));
        });
        
        orchestrator.on('taskFailed', ({ task, error }) => {
            failedTasks++;
            console.log(chalk.red(`✗ Failed: ${task.objective} - ${error.message}`));
        });
        
        orchestrator.on('qualityGateResult', ({ gate, result, task }) => {
            qualityGateResults.push({ gate, result, task: task.id });
            const icon = result.status === 'pass' ? '✓' : '✗';
            const color = result.status === 'pass' ? 'green' : 'red';
            console.log(chalk[color](`  ${icon} Quality Gate [${gate}]: ${result.status}`));
        });
        
        // Start execution
        await orchestrator.startExecution();
        
        // Wait for completion with timeout
        const timeout = setTimeout(() => {
            throw new Error('Execution timeout after 30 seconds');
        }, 30000);
        
        await orchestrator.waitForCompletion();
        clearTimeout(timeout);
        
        // 6. Verify results
        console.log('\n6️⃣ Verifying results...');
        const report = orchestrator.getFinalReport();
        
        // Check test results - allow skipped gates as they may need config files
        const allTestsPassed = [
            report.tasksCompleted === tasks.length,
            report.tasksFailed === 0,
            failedTasks === 0,
            completedTasks === tasks.length,
            qualityGateResults.length > 0
        ].every(test => test === true);
        
        // Count quality gate statuses
        const gateStatuses = qualityGateResults.reduce((acc, result) => {
            acc[result.result.status] = (acc[result.result.status] || 0) + 1;
            return acc;
        }, {});
        
        // Check artifacts were created - SimpleFileStore uses session subdirectory
        const sessionDir = path.join(process.cwd(), '.repochief/artifacts', 'e2e-test-todo');
        const artifactChecks = await Promise.all([
            fs.access(path.join(sessionDir, 'artifacts', 'e2e-comprehend-result.json')).then(() => true).catch(() => false),
            fs.access(path.join(sessionDir, 'artifacts', 'e2e-generate-result.json')).then(() => true).catch(() => false),
            fs.access(path.join(sessionDir, 'artifacts', 'e2e-test-result.json')).then(() => true).catch(() => false)
        ]);
        
        const artifactsCreated = artifactChecks.every(check => check === true);
        
        // 7. Display results
        console.log(chalk.bold.cyan('\n📊 Test Results:\n'));
        console.log(`Tasks completed: ${completedTasks}/${tasks.length} ${completedTasks === tasks.length ? '✅' : '❌'}`);
        console.log(`Tasks failed: ${failedTasks} ${failedTasks === 0 ? '✅' : '❌'}`);
        console.log(`Quality gates executed: ${qualityGateResults.length} ${qualityGateResults.length > 0 ? '✅' : '❌'}`);
        console.log(`Artifacts created: ${artifactsCreated ? '✅' : '❌'}`);
        
        // Display quality gate results
        if (qualityGateResults.length > 0) {
            console.log('\nQuality Gate Results:');
            qualityGateResults.forEach(({ gate, result, task }) => {
                const icon = result.status === 'pass' ? '✅' : 
                           result.status === 'skipped' ? '⏭️' : '❌';
                console.log(`  ${task} - ${gate}: ${result.status} ${icon}`);
            });
            
            // Show status summary
            console.log('\nGate Status Summary:');
            Object.entries(gateStatuses).forEach(([status, count]) => {
                console.log(`  ${status}: ${count}`);
            });
        }
        
        // Final verdict - consider test passed if no failures (skipped is OK)
        const hasFailedGates = gateStatuses.failed > 0 || gateStatuses.error > 0;
        const testSuccess = allTestsPassed && artifactsCreated && !hasFailedGates;
        
        if (testSuccess) {
            console.log(chalk.bold.green('\n✅ E2E TEST PASSED! All components working correctly.\n'));
            return true;
        } else {
            console.log(chalk.bold.red('\n❌ E2E TEST FAILED! Some components not working.\n'));
            if (!allTestsPassed) console.log('  - Task execution issues');
            if (!artifactsCreated) console.log('  - Artifacts not created');
            if (hasFailedGates) console.log('  - Quality gates failed');
            return false;
        }
        
    } catch (error) {
        console.error(chalk.red('\n❌ Test failed with error:'), error.message);
        if (error.stack) {
            console.error(chalk.dim(error.stack));
        }
        return false;
    } finally {
        // Cleanup
        if (api) {
            console.log('\n🧹 Stopping Cloud API...');
            await api.stop().catch(() => {});
        }
        
        // Force exit after a short delay to ensure cleanup
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }
}

// Run the test
runE2ETest().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error(error);
    process.exit(1);
});