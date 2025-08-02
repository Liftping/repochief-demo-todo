/**
 * RepoChief TODO Demo Package
 * Exports demo scenarios and utilities
 */

const TodoDemoRunner = require('./run-demo');
const scenarios = require('../scenarios/config.json');

module.exports = {
    TodoDemoRunner,
    scenarios,
    
    /**
     * Run a demo scenario programmatically
     */
    async runDemo(options = {}) {
        const runner = new TodoDemoRunner(options);
        return await runner.run();
    },
    
    /**
     * Get available scenarios
     */
    getScenarios() {
        return Object.keys(scenarios.scenarios).map(key => ({
            id: key,
            ...scenarios.scenarios[key]
        }));
    },
    
    /**
     * Get scenario configuration
     */
    getScenarioConfig(scenarioId) {
        return scenarios.scenarios[scenarioId] || null;
    }
};