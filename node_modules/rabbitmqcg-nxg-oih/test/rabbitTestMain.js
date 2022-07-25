const rabbit = require('./rabbitTest');

rabbit.prepareErrorQueue();

function testErrorQueue() {
	try {
		throw new Error('Testing error generated.');
	} catch(e) {
		const payload = {'test':'test'};
		rabbit.producerErrorMessage(payload, e);
	}
}

rabbit.producerMessage('Test message generated', 'myQueue');

testErrorQueue();