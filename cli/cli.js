#!/usr/bin/env node

import readline from 'readline';
import fetch from 'node-fetch';
import { io } from 'socket.io-client';
import fs from 'fs';


const CONFIG_FILE = '.blackhole-cli.json';
let config = null;
let token = null;
let baseURL = null;

try {
	const data = fs.readFileSync(CONFIG_FILE, 'utf8');
	config = JSON.parse(data);

	if (!config.token) {
		console.error('[Error] No token found in config file. Please set "token" in .blackhole-cli.json');
		process.exit(1);
	}

	if (!config.baseURL) {
		console.error('[Error] No baseURL found in config file. Please set "baseURL" in .blackhole-cli.json');
		process.exit(1);
	}

	try {
		new URL(config.baseURL);
	} catch (e) {
		console.error('[Error] Invalid baseURL format in config:', config.baseURL);
		process.exit(1);
	}

	token = config.token;
	baseURL = config.baseURL;

} catch (err) {
	if (err.code === 'ENOENT') {
		console.error('[Error] Config file not found. Please create a .blackhole-cli.json file with "token" and "baseURL".');
	} else {
		console.error('[Error] Failed to load config:', err.message);
	}
	process.exit(1);
}


let socket = null;
let room = null;
let inputState = { up: false, down: false };
let rl;
let currentInput = '';

console.log('Logging in...');
const payload = { token };


fetch(`${baseURL}/api/dash/verify-cli/`, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify(payload),
})
	.then(res => {
		return res.text().then(body => ({ status: res.status, ok: res.ok, body }));
	})
	.then(({ status, ok, body }) => {

		if (!ok) {
			console.error('[Error] Login failed:', status);
			process.exit(1);
		}

		let responseParsed = {};
		try {
			responseParsed = JSON.parse(body);
		} catch (e) {
			console.error('[Error] Failed to parse JSON:', e.message);
			process.exit(1);
		}

		const jwtToken = responseParsed.id;
		if (!jwtToken) {
			console.error('[Error] No token found in response.');
			process.exit(1);
		}

		socket = io('https://blackholejs.art', {
			path: '/game.socket/',
			transports: ['websocket'],
			auth: { token: jwtToken },
			withCredentials: true,
		});

		setupSocketHandlers();
		startShell();
	})
	.catch(err => {
		console.error('[Exception] Error:', err.message);
		console.error(err.stack);
		process.exit(1);
	});

function setupSocketHandlers() {
	socket.on('connect', () => {
		console.log('> Connected. Type your command.');
	});

	socket.on('connect_error', (err) => {
		console.error('Socket connection failed:', err.message);
		process.exit(1);
	});


	socket.on('queue:joined', () => {
		console.log('\n[+] You have joined the queue.');
	});

	socket.on('room:id', (event) => {
		room = event.roomid;
		socket.emit('room:join', { roomid: room });
		console.log('\n[+] You are in room:', room);
	});

	socket.on('game:message', (message) => {
		printAbovePrompt(`[Game Message] ${message}`);
	});

	socket.on('game:result', (event) => {
		printAbovePrompt(`[Game Result] ${event.result}`);
	});

	socket.on('game:init', (event) => {
		printAbovePrompt('[Game Init] Game initialized');
	});

	socket.on('game:over', (result) => {
		printAbovePrompt(`[Game Over] Result: ${JSON.stringify(result)}`);
	});

	socket.on('game:update', (tick) => {
		const line = `[Game Update] Tick: ${JSON.stringify(tick)}`;
		printAbovePrompt(line);
	});
}

function printAbovePrompt(message) {
	readline.moveCursor(process.stdout, 0, -1);
	readline.clearLine(process.stdout, 0);
	readline.cursorTo(process.stdout, 0);
	process.stdout.write(message + '\n');

	process.stdout.clearLine(0);
	process.stdout.cursorTo(0);
	process.stdout.write(`> ${currentInput}`);
}

function startShell() {
	rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: '> ',
	});

	process.stdin.on('data', (chunk) => {
		const char = chunk.toString();
		if (char === '\r' || char === '\n') {
			currentInput = '';
		} else if (char === '\u0008' || char === '\x7f') {
			currentInput = currentInput.slice(0, -1);
		} else {
			currentInput += char;
		}
	});

	rl.prompt();

	rl.on('line', (line) => {
		const input = line.trim();
		currentInput = '';

		if (input === 'exit') {
			console.log('Exiting CLI.');
			rl.close();
			socket?.disconnect();
			process.exit(0);
		}

		if (input === 'up') {
			inputState.up = true;
			inputState.down = false;
			sendInput();
			console.log('[Control] Paddle moving up');
			setTimeout(() => {
				inputState.up = false;
				inputState.down = false;
				sendInput();
			}, 1000 / 4);
		} else if (input === 'down') {
			inputState.down = true;
			inputState.up = false;
			sendInput();
			console.log('[Control] Paddle moving down');
			setTimeout(() => {
				inputState.up = false;
				inputState.down = false;
				sendInput();
			}, 1000 / 4);
		} else if (input === 'stop') {
			inputState.up = false;
			inputState.down = false;
			sendInput();
			console.log('[Control] Paddle stopped');
		} else if (input === 'queue-join') {
			socket.emit('queue:join');
			console.log('[Command] Sent: queue-join');
		} else if (input === 'queue-leave') {
			socket.emit('queue:cancel');
			console.log('[Command] Sent: queue-leave');
		} else {
			console.log('[Unknown Command]', input);
		}

		rl.prompt();
	});
}

function sendInput() {
	socket?.emit('game:paddle', inputState);
}
