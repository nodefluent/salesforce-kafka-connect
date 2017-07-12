# salesforce-kafka-connect

[![Greenkeeper badge](https://badges.greenkeeper.io/nodefluent/salesforce-kafka-connect.svg)](https://greenkeeper.io/)
Kafka Connect connector for Salesforce

[![Build Status](https://travis-ci.org/nodefluent/salesforce-kafka-connect.svg?branch=master)](https://travis-ci.org/nodefluent/salesforce-kafka-connect)

[![Coverage Status](https://coveralls.io/repos/github/nodefluent/salesforce-kafka-connect/badge.svg?branch=master)](https://coveralls.io/github/nodefluent/salesforce-kafka-connect?branch=master)

## Use API

```
npm install --save salesforce-kafka-connect
```

### salesforce -> kafka

```es6
const { runSourceConnector } = require("salesforce-kafka-connect");
runSourceConnector(config, [], onError).then(config => {
    //runs forever until: config.stop();
});
```

### kafka -> salesforce

```es6
const { runSinkConnector } = require("salesforce-kafka-connect");
runSinkConnector(config, [], onError).then(config => {
    //runs forever until: config.stop();
});
```

### kafka -> salesforce (with custom topic (no source-task topic))

```es6
const { runSinkConnector, ConverterFactory } = require("salesforce-kafka-connect");

const etlFunc = (messageValue, callback) => {

    //type is an example json format field
    if (messageValue.type === "publish") {
        return callback(null, {
            id: messageValue.payload.id,
            name__c: messageValue.payload.name,
            info__c: messageValue.payload.info
        });
    }

    if (messageValue.type === "unpublish") {
        return callback(null, null); //null value will cause deletion
    }

    callback(new Error("unknown messageValue.type"));
};

const converter = ConverterFactory.createSinkSchemaConverter({}, etlFunc);

runSinkConnector(config, [converter], onError).then(config => {
    //runs forever until: config.stop();
});

/*
    this example would be able to store kafka message values
    that look like this (so completely unrelated to messages created by a default SourceTask)
    {
        payload: {
            id: 1,
            name__c: "first item",
            info__c: "some info"
        },
        type: "publish"
    }
*/
```

## Use CLI
note: in BETA :seedling:

```
npm install -g salesforce-kafka-connect
```

```
# run source etl: salesforce -> kafka
nkc-salesforce-source --help
```

```
# run sink etl: kafka -> salesforce
nkc-salesforce-sink --help
```

## Config(uration)
```es6
const config = {
    kafka: {
        zkConStr: "localhost:2181/",
        logger: null,
        groupId: "kc-salesforce-test",
        clientName: "kc-salesforce-test-name",
        workerPerPartition: 1,
        options: {
            sessionTimeout: 8000,
            protocol: ["roundrobin"],
            fromOffset: "earliest", //latest
            fetchMaxBytes: 1024 * 100,
            fetchMinBytes: 1,
            fetchMaxWaitMs: 10,
            heartbeatInterval: 250,
            retryMinTimeout: 250,
            requireAcks: 1,
            //ackTimeoutMs: 100,
            //partitionerType: 3
        }
    },
    topic: "sc-test-topic",
    partitions: 1,
    maxTasks: 1,
    pollInterval: 2000,
    produceKeyed: true,
    produceCompressionType: 0,
    connector: {
        username: "salesforce",
        password: "salesforce",
        loginUrl: "https://test.salesforce.com",
        streamingSource: {
            batchSize: 5,
            topic: "StreamingTopic",
            kafkaTopic: "sf-test-topic",
            idProperty: "id"
        },
        restSink: {
            sObject: "sobject",
            idProperty: "id"
            batchSize: 500
        }
    },
    http: {
        port: 3149,
        middlewares: []
    },
    enableMetrics: true
};
```
