[![N|Solid](https://cloudgensys.com/cg-demo/wp-content/uploads/2019/05/CG-Logo-01.png)](https://www.cloudgensys.com/)

# rabbitmqCG-OIH

[![N|Solid](https://raw.githubusercontent.com/bjafet123/rabbitmqCG-OIH/f6666a262fb025226382cbed88057bd2a9909591/rm-files/rabbitmqCG-OIH.svg)](https://github.com/bjafet123/rabbitmqCG-OIH.git)

## _1. Introduction_

This code has the objective to send messages to a rabbitmq queues for the Open Integration Hub (OIH). This messages primarily will send an error message from OIH components to be handled.

This library is useful to add into the OIH components developed by their owners in order to have information for errors at flows execution time.

As components are used in the OIH flows regardless that the library should be added on component code, when the flow is running, an exchange and some queues are created using the ID flow (assigned from OIH). In the case of the queues, two queues are created for each step in the OIH flow.

The queue naming structure is as follows:

`flow–flowID:stepName:messages`

`flow–flowID:stepName:rebounds`  

![](https://github.com/bjafet123/rabbitmqCG-OIH/blob/main/rm-files/rm-img-01.png?raw=true)

Using the same structure for the OIH error handler queue (for each step) the next queue is created, internally, by the rabbitmqCG-OIH library.

`flow–flowID:stepName:deadletter`

Where _"flow"_ is a constant word, the _"flowID"_ is the ID assigned by the OIH to the flow, the _"stepName"_ is the name configured to each node in the flow and the words _"message"_/_"rebounds"_/_"deadletter"_ are constants.

And it is configured an exchange (the same used by the other queues).

![](https://github.com/bjafet123/rabbitmqCG-OIH/blob/main/rm-files/rm-img-02.png?raw=true)

Once this configuration is created by the library, messages can be sent to this queue.

## _2.	Library Methods_

The library can be installed from npm page with the next:

**`npm install rabbitmqcg-nxg-oih`**, **`npm i rabbitmqcg-nxg-oih`** or **`yarn install rabbitmqcg-nxg-oih`**

### _2.1. errorQueueListener

- **Args:** No arguments are required.
- **Description:** This method prepares the queue (deadletter) and the relation to the exchange, creating the queues and/or exchange if do not exist.
Once the code is set, at run time each time it occurs an error, a message is sent to the configured queue.
- **Sample:**
```js
//Sample applied into a component function for OIH

module.exports.process = async function processTrigger(msg, cfg, snapshot = {}) {
      try {
            await rabbitmq.prepareErrorQueue();
            //Your code here...
      } catch (e) {
        console.error(`ERROR: ${e}`);
        this.emit('error', e);
    }
};
```

Resultant sample:

![](https://github.com/bjafet123/rabbitmqCG-OIH/blob/main/rm-files/rm-img-03.png?raw=true)

\* **Note:** The library requires that the OIH has the "_`ELASTICIO_LISTEN_MESSAGES_ON`_" environment variable. If this variable is not available, the library defines an auto-generated queue and exchange. 

### _2.2. producerMessage_

- **Args:** 
    - Message: A String that contains the message to be sent to the deadletter queue.
    - QueueName: The given name of the queue that will receive the messages to be handled.  
- **Description:** This method prepares the queue (deadletter) and the relation to the exchange, creating the queues and/or exchange if do not exist. 
Once the code is set, at the time the code line is executed, the message content is sent to the queue.
- **Sample:**
```js
//Sample applied into a component function for OIH

module.exports.process = async function processTrigger(msg, cfg, snapshot = {}) {
      try {
            await rabbitmq.producerMessage(msg,'myQueueName');
            //Your code here...
      } catch (e) {
        console.error(`ERROR: ${e}`);
        this.emit('error', e);
    }
};
```

Resultant sample:

![](https://github.com/bjafet123/rabbitmqCG-OIH/blob/main/rm-files/rm-img-04.png?raw=true)

\* **Note:** The library requires that the OIH has the "_`ELASTICIO_LISTEN_MESSAGES_ON`_" environment variable. If this variable is not available, the library defines an auto-generated queue and exchange (using the QueueName argument).

### _2.3. producerErrorMessage_

- **Args:** 
    - Payload: The content of a request.
    - Error: The error message.
- **Description:** This method prepares the queue (deadletter) and the relation to the exchange, creating the queues and/or exchange if do not exist. 
Once the code is set, at the time an error is catched and the code is executed a message is sent to the queue with the payload content and with the error message.
- **Sample:**
```js
//Sample applied into a component function for OIH

module.exports.process = async function processTrigger(msg, cfg, snapshot = {}) {
      try {
            let {data} = msg;
            //Your code here...
      } catch (e) {
        console.error(`ERROR: ${e}`);
        this.emit('error', e);
        await rabbit.producerErrorMessage(msg, e);
    }
};
```

Resultant sample:

![](https://github.com/bjafet123/rabbitmqCG-OIH/blob/main/rm-files/rm-img-05.png?raw=true)

\* **Note:** The library requires that the OIH has the "_`ELASTICIO_LISTEN_MESSAGES_ON`_" environment variable. If this variable is not available, the library defines an auto-generated queue and exchange.

## _3. Testing Code_

The library contains a testing code that allows the user the behavior of the original code. This sample code shows to the user how to use the methods the library has.

The user must keep in mind that this code is developed to work without the OIH, and according to this the code creates the default queues as explained at the end of each method explanation (_at section 2_).

To run the testing code the next command can be used (**the starting location must be the code folder of this library**):

`npm test`

![](https://github.com/bjafet123/rabbitmqCG-OIH/blob/main/rm-files/rm-img-06.png?raw=true)
