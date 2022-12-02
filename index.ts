const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

const startTime = Date.now();

require('dotenv').config();

console.log('Connecting to server: ' + process.env.HOST)

function getDelayInSeconds(minSeconds, maxSeconds) {
    return Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds);
}

function getDelayInMilliseconds(minMilliseconds, maxMilliseconds) {
    return Math.floor(Math.random() * (maxMilliseconds - minMilliseconds + 1) + minMilliseconds);
}

let bot;

function joinPrison() {
    setTimeout(() => {
            bot.once('windowOpen', (window) => {
                setTimeout(async () => {
                    const count = window.containerItems().length
                    if (count) {
                        const items = window.containerItems();
                        const invItem = items.find(item => item.name === 'diamond_pickaxe');
                        if (invItem) {
                            const { slot } = invItem;
                            isRecconecting = false;
                            window.requiresConfirmation = false // fix
                            await bot.clickWindow(slot, 0, 0);
                            console.log('player has logged in.')
                            startConsoleCommands();
                        }
                    } else {
                        console.log("No items in inventory.")
                    }
                }, getDelayInSeconds(1, 3) * 1000); // delay for server selector click
            });

            bot.setQuickBarSlot(0)
            bot.activateItem()
            console.log("Bot has opened the server selector.")
    }, getDelayInSeconds(1, 5) * 1000); // Delay between 1 and 5 seconds for spawning
}

function startBot() {
    bot = mineflayer.createBot({
        host: process.env.HOST,
        port: process.env.PORT === '25565' ? undefined : process.env.PORT,
        auth: 'microsoft',
        version: '1.12.2'
    });

    bot.loadPlugin(pathfinder)

    bot.once('spawn', () => {
        console.log("Bot has logged in.")
        joinPrison();
    })

    // log all chat messages
    bot.on('chat', (username, message) => {
        if (username === bot.username) return
        const ignoredUsernames = process.env.IGNORED_USERNAMES?.split(',');
        if (ignoredUsernames?.includes(username)) return;
        console.log(`[${username}]: ${message}`)
    })

    bot.on('kicked', (reason, loggedIn) => {
        console.log("Bot has been kicked from the server.")
        if (loggedIn) {
            console.log("Bot is reconnecting.")
            bot.quit();
            setInterval(() => {
                startBot();
            }, getDelayInSeconds(4, 25) * 1000);
        }
    });
    bot.on('error', (err) => {
        setTimeout(() => {
            process.exit(1);
        }, Math.random() * 45000 + 30000);
    });
}


function handleChatCommand(command) {
    const commandParts = command.split(' ');
    if (commandParts[0] === 'chat') {
        const message = commandParts.slice(1).join(' ');
        bot.chat(message);
    }
}

function handleExecuteCommand(command) {
    const commandParts = command.split(' ');
    if (commandParts[0] === 'execute') {
        const command = commandParts.slice(1).join(' ');
        bot.chat('/' + command);
    }
}

function handleStopCommand() {
    console.log("Bot has logged off.");
    process.exit(0);
}

function handleTransferKeysCommand() {
    const keynames = [
        "token",
        "mine",
        "vote",
        "level",
        "rank",
        "mythical",
        "omega",
        "seasonal",
        "vote"
    ]
    // run the command /key withdraw name amount
    for (const keyname of keynames) {
        bot.chat(`/key withdraw ${keyname} 1`);
    }
}

let fastType = process.env.FAST_TYPE_ENABLED === 'true';

function listenForFastType(username, message) {
    if (!fastType) return;
    // message looks like Type the following word: [word]
    if (username !== 'REACTION') return;
    if (!message.startsWith('Type the following word:')) return;
    const word = message.split(' ')[4];
    setTimeout(() => {
        bot.chat(word);
    }, getDelayInMilliseconds(742, 3124));
}

let isRecconecting = false;

function startConsoleCommands() {
    // listen for console input and ignore the console.log
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', text => {
        // The following commands are available: chat <message>, execute <command>, stop, transferkeys <player>, reconnect, joinprison
        const incomingCommand = text.toString().trim();
        switch (incomingCommand) {
            case 'stop':
                handleStopCommand();
                break;
            case 'reconnect':
                if (!isRecconecting) {
                    isRecconecting = true;
                    console.log("Bot is reconnecting.");
                    bot.quit();
                    setInterval(() => {
                        startBot();
                    }, getDelayInSeconds(4, 25) * 1000);
                } else {
                    console.log("Bot is already reconnecting.");
                }
                break;
            case 'help':
                console.log("The following commands are available: chat <message>, execute <command>, stop, transferkeys <player>, reconnect, joinprison");
                break;
            case 'joinprison':
                joinPrison();
                break;
            default:
                if (incomingCommand.startsWith('chat')) {
                    handleChatCommand(incomingCommand);
                } else
                if (incomingCommand.startsWith('execute')) {
                    handleExecuteCommand(incomingCommand);
                } else 
                if (incomingCommand.startsWith('transferkeys')) {
                    // TODO: Implement
                } else {
                    console.log("Invalid command. List the available commands with 'help'.");
                }
                break;
        }
    });
}

startBot();
