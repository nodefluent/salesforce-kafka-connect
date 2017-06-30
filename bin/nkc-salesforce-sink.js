#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const { runSinkConnector } = require("./../index.js");
const pjson = require("./../package.json");
const loadConfig = require("./../config/loadConfig.js");
const log4bro = require("log4bro");
const { ConverterFactory  } = require("kafka-connect");

program
    .version(pjson.version)
    .option("-c, --config [string]", "Path to Config (optional)")
    .option("-k, --kafka [string]", "Zookeeper Connection String")
    .option("-g, --group [string]", "Kafka ConsumerGroup Id")
    .option("-t, --topic [string]", "Kafka Topic to read from")
    .option("-u, --username [string]", "Salesforce username")
    .option("-p, --password [string]", "Salesforce password")
    .option("-l, --login_url [string]", "Custom login url (optional)")
    .option("-s, --sobject [string]", "sobject name")
    .option("-i, --id_property [string]", "Id property for external id field")
    .parse(process.argv);

const config = loadConfig(program.config);
config.kafka.logger = new log4bro();

if (program.kafka) {
    config.kafka.zkConStr = program.kafka;
}

if (program.name) {
    config.kafka.clientName = program.name;
}

if (program.topic) {
    config.topic = program.topic;
}

if (program.username) {
    config.connector.username = program.username;
}

if (program.password) {
    config.connector.password = program.password;
}

if (program.sobject) {
    config.connector.restSink.sobject = program.sobject;
}

if (program.id_property) {
    config.connector.restSink.idProperty = program.idProperty;
}


const etlFunc = (messageValue, callback) => {

    if (!messageValue.payload) {
        return callback(null, null);
    }

    callback(null, messageValue.payload);
};

const converter = ConverterFactory.createSinkSchemaConverter({}, etlFunc);

runSinkConnector(config, [converter], console.log.bind(console)).then(sink => {

    const exit = (isExit = false) => {
        sink.stop();
        if (!isExit) {
            process.exit();
        }
    };

    process.on("SIGINT", () => {
        exit(false);
    });

    process.on("exit", () => {
        exit(true);
    });
});
