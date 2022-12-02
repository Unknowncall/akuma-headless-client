var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var mineflayer = require('mineflayer');
var _a = require('mineflayer-pathfinder'), pathfinder = _a.pathfinder, Movements = _a.Movements, goals = _a.goals;
var startTime = Date.now();
require('dotenv').config();
console.log('Connecting to server: ' + process.env.HOST);
function getDelayInSeconds(minSeconds, maxSeconds) {
    return Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds);
}
var bot;
function joinPrison() {
    var _this = this;
    setTimeout(function () {
        // select a random block 5 blocks away but in the direction the bot is looking
        var offSetLeft = Math.floor(Math.random() * 10) - 5;
        var offSetRight = Math.floor(Math.random() * 10) - 5;
        var offSetForward = Math.floor(Math.random() * 10) - 5;
        var target = bot.entity.position.offset(offSetLeft, 0, offSetRight).offset(0, 0, offSetForward);
        // path to the block
        bot.pathfinder.setMovements(new Movements(bot));
        bot.pathfinder.setGoal(new goals.GoalBlock(target.x, target.y, target.z));
        console.log("Bot has started pathing to block.");
        setTimeout(function () {
            bot.once('windowOpen', function (window) {
                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                    var count, items, invItem, slot;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                count = window.containerItems().length;
                                if (!count) return [3 /*break*/, 3];
                                items = window.containerItems();
                                invItem = items.find(function (item) { return item.name === 'diamond_pickaxe'; });
                                if (!invItem) return [3 /*break*/, 2];
                                slot = invItem.slot;
                                isRecconecting = false;
                                window.requiresConfirmation = false; // fix
                                return [4 /*yield*/, bot.clickWindow(slot, 0, 0)];
                            case 1:
                                _a.sent();
                                console.log('player has logged in.');
                                startConsoleCommands();
                                _a.label = 2;
                            case 2: return [3 /*break*/, 4];
                            case 3:
                                console.log("No items in inventory.");
                                _a.label = 4;
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }, getDelayInSeconds(1, 3) * 1000); // delay for server selector click
            });
            bot.setQuickBarSlot(0);
            bot.activateItem();
            console.log("Bot has opened the server selector.");
        }, getDelayInSeconds(5, 10) * 1000); // delay 5-10 seconds for movments
    }, getDelayInSeconds(1, 5) * 1000); // Delay between 1 and 5 seconds for spawning
}
function startBot() {
    bot = mineflayer.createBot({
        host: process.env.HOST,
        port: process.env.PORT === '25565' ? undefined : process.env.PORT,
        auth: 'microsoft',
        version: '1.12.2'
    });
    bot.loadPlugin(pathfinder);
    bot.once('spawn', function () {
        console.log("Bot has logged in.");
        joinPrison();
    });
    // log all chat messages
    bot.on('chat', function (username, message) {
        var _a;
        if (username === bot.username)
            return;
        var ignoredUsernames = (_a = process.env.IGNORED_USERNAMES) === null || _a === void 0 ? void 0 : _a.split(',');
        if (ignoredUsernames === null || ignoredUsernames === void 0 ? void 0 : ignoredUsernames.includes(username))
            return;
        console.log("[".concat(username, "]: ").concat(message));
    });
    bot.on('kicked', function (reason, loggedIn) { return console.log(reason, loggedIn); });
    bot.on('error', function (err) {
        setTimeout(function () {
            process.exit(1);
        }, Math.random() * 45000 + 30000);
    });
}
function handleChatCommand(command) {
    var commandParts = command.split(' ');
    if (commandParts[0] === 'chat') {
        var message = commandParts.slice(1).join(' ');
        bot.chat(message);
    }
}
function handleExecuteCommand(command) {
    var commandParts = command.split(' ');
    if (commandParts[0] === 'execute') {
        var command_1 = commandParts.slice(1).join(' ');
        bot.chat('/' + command_1);
    }
}
function handleStopCommand() {
    console.log("Bot has logged off.");
    process.exit(0);
}
function handleTransferKeysCommand(command) {
    var keynames = [
        "token",
        "mine",
        "vote",
        "level",
        "rank",
        "mythical",
        "omega",
        "seasonal",
        "vote"
    ];
    // run the command /key withdraw name amount
    for (var _i = 0, keynames_1 = keynames; _i < keynames_1.length; _i++) {
        var keyname = keynames_1[_i];
        bot.chat("/key withdraw ".concat(keyname, " 1"));
    }
}
var isRecconecting = false;
function startConsoleCommands() {
    // listen for console input and ignore the console.log
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (text) {
        // The following commands are available: chat <message>, execute <command>, stop, transferkeys <player>, reconnect, joinprison
        var incomingCommand = text.toString().trim();
        switch (incomingCommand) {
            case 'stop':
                handleStopCommand();
                break;
            case 'reconnect':
                if (!isRecconecting) {
                    isRecconecting = true;
                    console.log("Bot is reconnecting.");
                    bot.quit();
                    setInterval(function () {
                        startBot();
                    }, getDelayInSeconds(4, 25) * 1000);
                }
                else {
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
                }
                else if (incomingCommand.startsWith('execute')) {
                    handleExecuteCommand(incomingCommand);
                }
                else if (incomingCommand.startsWith('transferkeys')) {
                    handleTransferKeysCommand(incomingCommand);
                }
                else {
                    console.log("Invalid command. List the available commands with 'help'.");
                }
                break;
        }
    });
}
startBot();
