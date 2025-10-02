import { Kafka } from "kafkajs";

const kafka = new Kafka({
	clientId: "blackholejs-game",
	brokers: ["kafka:9092"]
});


export default kafka;