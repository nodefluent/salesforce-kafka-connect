"use strict";

const path = require("path");
const Logger = require("log4bro");

const config = {
    kafka: {
        zkConStr: "localhost:2181/",
        logger: new Logger(),
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
            requireAcks: 0,
            //ackTimeoutMs: 100,
            //partitionerType: 3
        }
    },
    topic: "sf_table_topic",
    partitions: 1,
    maxTasks: 1,
    maxPollCount: 5,
    pollInterval: 250,
    produceKeyed: true,
    produceCompressionType: 0,
    connector: {
        username: "salesforce",
        password: "salesforce",
        streamingSource: {
            topic: "salesforceTopic",
            idProperty: "id"
        },
        restSink: {
        }
    }
};

module.exports = config;
