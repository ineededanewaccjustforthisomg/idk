const chalk = require('chalk');
const figlet = require('figlet');
const os = require("os");

const printBox = (lines) => {
    const contentWidth = Math.max(...lines.map(l => l.replace(/\x1B\[[0-9;]*m/g, '').length)); // ignore color codes
    const border = '═'.repeat(contentWidth + 2);
    console.log(chalk.green.bold(`╔${border}╗`));
    for (const line of lines) {
        const plainLength = line.replace(/\x1B\[[0-9;]*m/g, '').length;
        const padding = ' '.repeat(contentWidth - plainLength);
        console.log(chalk.green.bold('║') + ' ' + line + padding + ' ' + chalk.green.bold('║'));
    }
    console.log(chalk.green.bold(`╚${border}╝`));
};

const printStartupBanner = (port) => {
    const cpuLoad = os.loadavg()[0].toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
    const usedMem = totalMem - freeMem;
    const memUsage = ((usedMem / totalMem) * 100).toFixed(1);

    console.log('');
    console.log(chalk.magenta(figlet.textSync('Blockveil: Redux', { horizontalLayout: 'default' })));
    const copyright = 'Do not modify or release without permission from Fijlow! Piracy is not a joke.';
    console.log(chalk.red(copyright));
    console.log('');

    printBox([
        `🧠 CPU Load: ${chalk.yellow(cpuLoad)} | 💾 RAM: ${chalk.yellow(`${usedMem}/${totalMem} MB (${memUsage}%)`)}`,
        `💻 Hostname: ${chalk.cyan(os.hostname())}`
    ]);
    
    printBox([
        `🚨 Piracy is not a joke, this API is owned by Fijlow.`
    ]);
    
    printBox([
        `🚀 Listening on: ${chalk.cyan(`http://localhost:${port}`)}`,
    ]);
    
    printBox([
        `🔥 Version ${chalk.cyan(`1.9.17`)}`
    ]);
};

module.exports = printStartupBanner;