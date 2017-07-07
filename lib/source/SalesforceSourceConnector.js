"use strict";

const { SourceConnector } = require("kafka-connect");
const jsforce = require('jsforce');

class SalesforceSourceConnector extends SourceConnector {

    start(properties, callback) {

        this.properties = properties;

        if(this.properties.streamingSource.retrieveObject &&
            !this.properties.streamingSource.sObject) {
            throw new Error("Invalid config: sObject must be specified to retrieve it.")
        }

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
            idProperty: this.properties.streamingSource.idProperty,
            retrieveObject: this.properties.streamingSource.retrieveObject || false,
            sObject: this.properties.streamingSource.sObject
        };

        callback(null, taskConfig);
    }

    stop() {
        this.connection.logout();
    }
}

module.exports = SalesforceSourceConnector;
