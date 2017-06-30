"use strict";

const { SourceConnector } = require("kafka-connect");
const jsforce = require('jsforce');

class SalesforceSourceConnector extends SourceConnector {

    start(properties, callback) {

        this.properties = properties;

        const options = {};
        if (this.properties.loginUrl) {
            options.loginUrl = this.properties.loginUrl;
        }

        this.connection = new jsforce.Connection(options);

        this.connection.login(
            this.properties.username,
            this.properties.password,
            callback);
    }

    taskConfigs(maxTasks, callback) {

        const taskConfig = {
            connection: this.connection,
            batchSize: this.properties.streamingSource.batchSize,
            topic: this.properties.streamingSource.topic,
            kafkaTopic: this.properties.streamingSource.kafkaTopic,
            idProperty: this.properties.streamingSource.idProperty
        };

        callback(null, taskConfig);
    }

    stop() {
        this.connection.logout();
    }
}

module.exports = SalesforceSourceConnector;
