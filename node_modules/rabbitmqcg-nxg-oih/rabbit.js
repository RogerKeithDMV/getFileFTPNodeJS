require('dotenv').config();
const amqp = require('amqplib');
const log = require('./helpers/logger');

module.exports.errorQueueListener = async () => {
    try{
        const random = getRandomInt();
        let exchangeDLX = 'error-queue';
        let queueDLX = 'error-queue:' + random + ':deadletter';
        let routingKey = 'error-queue.' + random + '.deadletter';;
        if (process.env.ELASTICIO_LISTEN_MESSAGES_ON) {
        	const componentProp = process.env.ELASTICIO_LISTEN_MESSAGES_ON.split(":");
        	if (componentProp) {
		        exchangeDLX = componentProp[0];
		        queueDLX = componentProp[0] + ':' + componentProp[1] + ':deadletter';
		        routingKey = componentProp[0] + '.' + componentProp[1] + '.deadletter';
	        }
        }
        log.info(queueDLX);

        let connection = await amqp.connect(process.env.URI_RABBITMQ);

        const ch = await connection.createChannel();

        await ch.assertExchange(exchangeDLX, 'topic', {durable: true});

        const queue = await ch.assertQueue(queueDLX, {
            exclusive: false
        });

        await ch.bindQueue(queue.queue, exchangeDLX, routingKey);

        await ch.close();
    }catch (e){
        log.error(`ERROR on rabbit: ${e}`);
    }
};

module.exports.producerMessage = async (message, queueName) => {
    try{
        let exchangeDLX = 'message-queue';
        let queueDLX = 'message-queue:' + queueName + ':analitics';
        let routingKey = 'message-queue.' + queueName + '.analitics';
        if (process.env.ELASTICIO_LISTEN_MESSAGES_ON) {
        	const componentProp = process.env.ELASTICIO_LISTEN_MESSAGES_ON.split(":");
        	if (componentProp) {
		        exchangeDLX = componentProp[0];
		        queueDLX = componentProp[0] + ':' + queueName + ':analitics';
		        routingKey = componentProp[0] + '.' + queueName + '.analitics';
	        }
        }
        log.info(queueDLX);

        let connection = await amqp.connect(process.env.URI_RABBITMQ);

        const ch = await connection.createChannel();

        await ch.assertExchange(exchangeDLX, 'topic', {durable: true});

        const queue = await ch.assertQueue(queueDLX, {
            exclusive: false
        });

        await ch.bindQueue(queue.queue, exchangeDLX, routingKey);

        //ch.sendToQueue(queue.queue, new Buffer.from(message.toString()),{persistent: true});
        const trace = {"message": message.toString()}
        ch.publish(exchangeDLX, routingKey, new Buffer.from(JSON.stringify(trace)),{persistent: true});

        await ch.close();
    }catch (e){
        log.error(`ERROR on rabbit: ${e}`);
    }
};

module.exports.producerErrorMessage = async (payload, error) => {
    try{
        const random = getRandomInt();
        let exchangeDLX = 'error-queue';
        let queueDLX = 'error-queue:' + random + ':deadletter';;
        let routingKey = 'error-queue.' + random + '.deadletter';;
        if (process.env.ELASTICIO_LISTEN_MESSAGES_ON) {
        	const componentProp = process.env.ELASTICIO_LISTEN_MESSAGES_ON.split(":");
        	if (componentProp) {
		        exchangeDLX = componentProp[0];
		        queueDLX = componentProp[0] + ':' + componentProp[1] + ':deadletter';
		        routingKey = componentProp[0] + '.' + componentProp[1] + '.deadletter';
	        }
        }
        log.info(queueDLX);

        let connection = await amqp.connect(process.env.URI_RABBITMQ);

        const ch = await connection.createChannel();

        await ch.assertExchange(exchangeDLX, 'topic', {durable: true});

        const queue = await ch.assertQueue(queueDLX, {
            exclusive: false
        });

        await ch.bindQueue(queue.queue, exchangeDLX, routingKey);

        //ch.sendToQueue(queue.queue, new Buffer.from(message.toString()),{persistent: true});
        const emsg = error.toString();
        const trace = {"error-message": emsg, "payload": payload.toString()};
        ch.publish(exchangeDLX, routingKey, new Buffer.from(JSON.stringify(trace)), {persistent: true});

        await ch.close();
    }catch (e){
        log.error(`ERROR on rabbit: ${e}`);
    }
};

//This function creates a random number used when a queue can't be defined
function getRandomInt() {
  return Math.random().toString().split(".")[1].substring(0,8);
}