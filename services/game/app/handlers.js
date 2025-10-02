



function disableGameSocketHandlers(socket) {

	const keep = [];
	const events = socket.eventNames();

	for (const event of events) {
		if (typeof event === 'string' && !keep.includes(event)) {
			socket.removeAllListeners(event);

		}
	}
}


function enableGameSocketHandlers(socket, app) {
	const sid = socket.id;
	socket.on('queue:join', async function queueJoinHandler() {
		try {

			await app.queue.add(socket);

			socket.emit('queue:joined', "You joined a queue");

			if (app.queue.canMatch()) {
				const roomId = app.roomManager.genRoom();
				const players = await app.queue.get2players() || [];

				for (const player of players) {
					player.socket.emit('room:id', { roomid: roomId });

				}
			}
		} catch (err) {
			console.log("Queue Join Error -->", err);
		}
	});



	socket.on('queue:cancel', async function queueCancelHandler() {
		try {
			app.queue.delete(sid);

			socket.emit('queue:canceled', "");
		} catch (err) {
			console.log("Queue Cancel Error -->", err);
		}
	});



	socket.on('room:join', function roomJoinHandler(event) {
		try {
			const roomId = event.roomid;

			if (!app.roomManager.roomExist(roomId)) {
				return socket.emit('room:error', "Room not playable");
			}

			if (!app.roomManager.already_joined(roomId, sid)) {
				disableGameSocketHandlers(socket);
				app.roomManager.joinRoom(roomId, socket);
				socket.emit('room:joined', "Room Joined");

			}
		} catch (err) {
			console.log("Room Join Error -->", err);
		}
	});

	socket.on('message', function messageHandler(message) {
		console.log("Message event from", sid, ":", message);
	});


	socket.on('disconnect', async function () {
		app.queue.delete(sid);
	});
}


export { enableGameSocketHandlers, disableGameSocketHandlers };