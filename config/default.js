"use strict";

const path = require("path");

const config = {
    kafka: {
        zkConStr: "localhost:2181/",
        logger: null,
        groupId: "kc-salesforce-group",
        clientName: "kc-salesforce-client",
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
            autoCommit: true,
            autoCommitIntervalMs: 1000,
            requireAcks: 1,
            //ackTimeoutMs: 100,
            //partitionerType: 3
        }
    },
    topic: "sf-test-topic",
    partitions: 1,
    maxTasks: 1,
    maxPollCount: 5,
    pollInterval: 250,
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

module.exports = config;
