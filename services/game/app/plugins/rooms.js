

import FP from 'fastify-plugin';
import PongGame from '../game/game.js';



class RoomsManager {
	constructor(fastify) {
		this.curRooms = new Map();
		this.playingRooms = [];

		this.app = fastify;
	}

	genRoom() {
		const timePart = Date.now().toString(36);
		const randomPart = Math.random().toString(36).slice(2, 8);
		const roomId = `${timePart}-${randomPart}`;


		this.curRooms.set(roomId, new PongGame(this.app));
		return roomId;
	}

	joinRoom(roomId, socket) {
		const Room = this.curRooms.get(roomId);
		if (!Room)
			return;
		if (Room.add_player(socket)) {
			this.playingRooms.push(Room);
			this.curRooms.delete(roomId);
			const [id1, id2] = Room.get_players_ids();
			Room.start().then(async (data) => {


				try {
					this.app.kafka.send('newGame', [{
						value: JSON.stringify({
							id1, id2, points1: data.score[id1], points2: data.score[id2], date: new Date().toISOString()
						})
					}]);
					const disconnectPlayerId = data.disconnected || [];
				} catch (err) {
					console.log(err);
				}
			});
		}

	}
	roomExist(roomId) {
		return (this.curRooms.get(roomId) !== undefined);
	}

	already_joined(roomId, uid) {
		const already = this.curRooms.get(roomId).already_joined(uid);
		return (already);
	}
}

export default FP(async (fastify) => {
	try {
		const roomManager = new RoomsManager(fastify);
		fastify.decorate('roomManager', roomManager);
		fastify.log.info("game-rooms manager attached");
	} catch {
		fastify.log.error("failed to connect (game-rooms manager)");
	}
});

