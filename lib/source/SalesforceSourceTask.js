"use strict";

const { SourceTask, SourceRecord } = require("kafka-connect");

class SalesforceSourceTask extends SourceTask {

    start(properties, callback, parentConfig) {

        this.parentConfig = parentConfig;

        this.properties = properties;
        const {
            connection,
            batchSize,
            topic,
            kafkaTopic,
            idProperty,
            retrieveObject,
            sObject
        } = this.properties;

        this.connection = connection;
        this.batchSize = batchSize;
        this.topic = topic;
        this.kafkaTopic = kafkaTopic;
        this.idProperty = idProperty;
        this.retrieveObject = retrieveObject;
        this.sObject = sObject;

        this.buffer = [];
        this._stats = {
            messagesReceived: 0,
            messagesPolled: 0,
            currentBufferLength: 0
        };

        this.parentConfig.on("get-stats", () => {
            this.parentConfig.emit("any-stats", "salesforce-source", this._stats);
        });

        this.handler = (message => {
            this._stats.messagesReceived++;
            const id = message.sobject[this.idProperty];
            const type = message.event.type;
            if (this.retrieveObject) {
                this.connection.sobject(this.sObject).retrieve(id, (error, ticket) => {
                    if (error) {
                        return console.log(`Failed to retrieve ${this.sObject} ${id}: ${error.message}`);
                    }

                    this._pushRecord(ticket, type);
                });
            } else {
                this._pushRecord(message.sobject, type)
            }
        }).bind(this);

        this.connection.streaming.topic(this.topic).subscribe(this.handler);

        callback();
    }

    _pushRecord(item, type) {
        const record = new SourceRecord();

        record.key = item[this.idProperty];
        record.keySchema = null;

        if (!record.key) {
            throw new Error("No id found in record.");
        }

        record.value = item;
        record.valueSchema = null;
        record.type = type;

        record.timestamp = new Date().toISOString();
        record.partition = -1;
        record.topic = this.kafkaTopic;

        this.parentConfig.emit("record-read", record.key.toString());
        this.buffer.push(record);
        this._stats.currentBufferLength = this.buffer.length;
    }

    poll(callback) {

        const records = this.buffer.splice(0, Math.min(this.batchSize, this.buffer.length));

        this._stats.messagesPolled += records.length;
        this._stats.currentBufferLength = this.buffer.length;

        callback(null, records);
    }

    stop() {
        this.connection.streaming.topic(this.topic).unsubscribe(this.handler);
    }
}

module.exports = SalesforceSourceTask;
