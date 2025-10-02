
import FP from 'fastify-plugin';
import { Mutex } from 'async-mutex';

class matchingQueue {
	constructor() {
		this.pool = [];
		this.mutex = new Mutex();
	}

	async add(socket) {
		const release = await this.mutex.acquire();
		try {
			this.pool.push({ time: Date.now(), socket });
		} finally {
			release();
		}
	}

	async get2players() {
		const release = await this.mutex.acquire();
		try {
			if (this.pool.length < 2)
				return null;

			this.pool.sort((a, b) => a.time - b.time);

			for (let i = 0; i < this.pool.length; ++i) {
				for (let j = i + 1; j < this.pool.length; ++j) {
					if (this.pool[i].socket.user !== this.pool[j].socket.user) {
						const player1 = this.pool[i];
						const player2 = this.pool[j];

						this.pool = this.pool.filter(p => p !== player1 && p !== player2);

						return [player1, player2];
					}
				}
			}

			const sameIdMap = new Map();
			this.pool = this.pool.filter(player => {
				const id = player.socket.user;
				if (sameIdMap.has(id)) {
					return false;
				} else {
					sameIdMap.set(id, true);
					return true;
				}
			});

			return null;
		} finally {
			release();
		}
	}


	canMatch() {
		const uniqueIds = new Set();

		for (const player of this.pool) {
			uniqueIds.add(player.socket.user);
			if (uniqueIds.size >= 2)
				return true;
		}

		return false;
	}


	delete(id) {
		if (!id) return;
		this.pool = this.pool.filter(item => item.socket.id !== id);
	}
}

async function cache_plugin(fastify) {
	try {
		fastify.decorate('queue', new matchingQueue());
		fastify.log.info("match-making system (queue) attached");

	} catch {
		fastify.log.error("failed to connect match-making system (queue)");
	}

}

export default FP(cache_plugin);
