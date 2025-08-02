#!/usr/bin/env node

/**
 * Demo Recording Script
 * Sets up screen recording and runs the demo with visual enhancements
 */

const { spawn } = require('child_process');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');

class DemoRecorder {
    constructor() {
        this.outputDir = path.join(process.cwd(), 'recordings');
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    }
    
    async run() {
        console.log(chalk.bold.cyan('\n🎬 RepoChief Demo Recorder\n'));
        
        // Check prerequisites
        await this.checkPrerequisites();
        
        // Get recording settings
        const settings = await this.getSettings();
        
        // Prepare recording
        await this.prepareRecording();
        
        // Start recording
        console.log(chalk.yellow('\n📹 Starting recording...\n'));
        await this.startRecording(settings);
    }
    
    async checkPrerequisites() {
        console.log(chalk.yellow('Checking prerequisites...'));
        
        // Check for asciinema (terminal recorder)
        const hasAsciinema = await this.commandExists('asciinema');
        if (!hasAsciinema) {
            console.error(chalk.red('❌ asciinema not found. Install with: brew install asciinema'));
            process.exit(1);
        }
        
        // Check for ffmpeg (video converter)
        const hasFfmpeg = await this.commandExists('ffmpeg');
        if (!hasFfmpeg) {
            console.warn(chalk.yellow('⚠️  ffmpeg not found. Install for video conversion.'));
        }
        
        console.log(chalk.green('✓ Prerequisites satisfied\n'));
    }
    
    async commandExists(cmd) {
        return new Promise(resolve => {
            const check = spawn('which', [cmd]);
            check.on('close', code => resolve(code === 0));
        });
    }
    
    async getSettings() {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'scenario',
                message: 'Which scenario to record?',
                choices: ['basic', 'fullstack', 'enterprise']
            },
            {
                type: 'confirm',
                name: 'mockMode',
                message: 'Use mock mode?',
                default: true
            },
            {
                type: 'confirm',
                name: 'withAudio',
                message: 'Include audio narration?',
                default: false
            }
        ]);
        
        return answers;
    }
    
    async prepareRecording() {
        // Create recordings directory
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        
        // Create demo script with visual enhancements
        const demoScript = `#!/bin/bash
set -e

# Clear screen and show banner
clear
echo -e "\\033[1;36m"
figlet -f slant "RepoChief" 2>/dev/null || echo "RepoChief"
echo -e "\\033[0m"
echo "AI Agent Orchestration Platform - Demo Recording"
echo "================================================"
echo ""
sleep 3

# Run the demo with enhanced output
DEMO_SCENARIO=${process.env.DEMO_SCENARIO || 'basic'} \\
MOCK_MODE=${process.env.MOCK_MODE || 'true'} \\
node ${path.join(__dirname, '..', 'src', 'run-demo.js')} --verbose

echo ""
echo "Demo completed! Press any key to exit..."
read -n 1
`;
        
        const scriptPath = path.join(this.outputDir, 'demo-script.sh');
        fs.writeFileSync(scriptPath, demoScript);
        fs.chmodSync(scriptPath, '755');
        
        return scriptPath;
    }
    
    async startRecording(settings) {
        const outputFile = path.join(
            this.outputDir, 
            `repochief-demo-${settings.scenario}-${this.timestamp}.cast`
        );
        
        // Set environment
        process.env.DEMO_SCENARIO = settings.scenario;
        process.env.MOCK_MODE = settings.mockMode.toString();
        
        // Start asciinema recording
        const recordCmd = [
            'rec',
            outputFile,
            '--title', `RepoChief ${settings.scenario} Demo`,
            '--idle-time-limit', '2',
            '--command', path.join(this.outputDir, 'demo-script.sh')
        ];
        
        console.log(chalk.dim(`Recording to: ${outputFile}\n`));
        
        const recording = spawn('asciinema', recordCmd, {
            stdio: 'inherit',
            env: process.env
        });
        
        return new Promise((resolve, reject) => {
            recording.on('close', (code) => {
                if (code === 0) {
                    console.log(chalk.green(`\n✅ Recording saved to: ${outputFile}`));
                    this.showNextSteps(outputFile, settings);
                    resolve();
                } else {
                    reject(new Error(`Recording failed with code ${code}`));
                }
            });
            
            recording.on('error', reject);
        });
    }
    
    showNextSteps(recordingFile, settings) {
        console.log(chalk.yellow('\n📋 Next Steps:\n'));
        
        console.log('1. Upload to asciinema.org:');
        console.log(chalk.dim(`   asciinema upload ${recordingFile}\n`));
        
        console.log('2. Convert to GIF (requires agg):');
        console.log(chalk.dim(`   agg ${recordingFile} demo.gif\n`));
        
        console.log('3. Convert to video (requires ffmpeg):');
        console.log(chalk.dim(`   # First convert to gif, then:`));
        console.log(chalk.dim(`   ffmpeg -i demo.gif -movflags faststart -pix_fmt yuv420p demo.mp4\n`));
        
        if (settings.withAudio) {
            console.log('4. Add audio narration:');
            console.log(chalk.dim(`   # Record audio separately and merge with ffmpeg`));
        }
    }
}

// Run the recorder
const recorder = new DemoRecorder();
recorder.run().catch(error => {
    console.error(chalk.red('\n❌ Recording failed:'), error.message);
    process.exit(1);
});