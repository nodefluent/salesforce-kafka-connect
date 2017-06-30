#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const { runSourceConnector } = require("./../index.js");
const pjson = require("./../package.json");
const loadConfig = require("./../config/loadConfig.js");

program
    .version(pjson.version)
    .option("-c, --config [string]", "Path to Config (alternatively)")
    .option("-k, --kafka [string]", "Zookeeper Connection String")
    .option("-n, --client_name [string]", "Kafka Client Name")
    .option("-t, --topic [string]", "Kafka Topic to Produce to")
    .option("-a, --partitions [integer]", "Amount of Kafka Topic Partitions")
    .option("-u, --username [string]", "Salesforce username")
    .option("-p, --password [string]", "Salesforce password")
    .option("-s, --salesforce_topic [string]", "Salesforce streaming API topic name")
    .option("-i, --id_property [string]", "Id property for message keys")
    .option("-v, --interval [integer]", "Table poll interval (ms)")
    .option("-o, --max_pollcount [integer]", "Max row count per poll action")
    .parse(process.argv);

const config = loadConfig(program.config);

if (program.kafka) {
    config.kafka.zkConStr = program.kafka;
}

if (program.client_name) {
    config.kafka.clientName = program.client_name;
}

if (program.topic) {
    config.topic = program.topic;
}

if (program.partitions) {
    config.partitions = program.partitions;
}

if (program.username) {
    config.connector.username = program.username;
}

if (program.password) {
    config.connector.password = program.password;
}

if (program.salesforce_topic) {
    config.connector.streamingSource.topic = program.salesforce_topic;
}

if (program.id_property) {
    config.connector.streamingSource.idProperty = program.id_property;
}

if (program.interval) {
    config.pollInterval = program.interval;
}

if (program.max_pollcount) {
    config.connector.maxPollCount = program.max_pollcount;
}

runSourceConnector(config, [], console.log.bind(console)).then(sink => {

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
