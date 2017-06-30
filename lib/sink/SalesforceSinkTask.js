"use strict";

const async = require("async");
const { SinkTask } = require("kafka-connect");

class SalesforceSinkTask extends SinkTask {

    start(properties, callback, parentConfig) {

        this.parentConfig = parentConfig;
        this.properties = properties;
        const {
            maxTasks,
            connection,
            sObject,
            idProperty,
            batchSize
        } = this.properties;

        this.maxTasks = maxTasks;
        this.connection = connection;
        this.sObject = sObject;
        this.idProperty = idProperty;
        this.batchSize = batchSize;

        this.upserts = [];
        this.deletes = [];

        this._stats = {
            totalUpserts: 0,
            totalDeletes: 0,
            bulkUpsertErrors: 0,
            bulkDeleteErrors: 0,
            currentUpsertsBufferLength: 0,
            currentDeletesBuferLength: 0
        }

        this.parentConfig.on("get-stats", () => {
            this.parentConfig.emit("any-stats", "salesforce-sink", this._stats);
        });

        return callback();
    }

    _upsert(upserts, callback) {
        if (upserts.length === 0) {
            return callback();
        }

        this.connection.sobject(this.properties.sObject).upsertBulk(upserts, this.idProperty, (error, results) => {
            if (error) {
                this._stats.bulkUpsertErrors++;
                return callback(error);
            }

            if (results.some(r => !r.success)) {
                this._stats.bulkUpsertErrors++;
                return callback(new Error(`Some bulk upserts failed: ${JSON.stringify(results)}`));
            }

            this._stats.totalUpserts += upserts.length;

            callback();
        });
    }

    _delete(deletes, callback) {
        if (deletes.length === 0) {
            return callback();
        }

        this.connection.sobject(this.sObject)
            .find({ uuid : deletes })
            .destroy((error, results) => {
                if (error) {
                    this._stats.bulkDeleteErrors++;
                    return callback(error);
                }

                if(results.some(r => !r.success)) {
                    this._stats.bulkDeleteErrors++;
                    return callback(new Error(`Some bulk deletes failed: ${JSON.stringify(results)}`));
                }

                this._stats.totalDeletes += deletes.length;

                callback();
            });
    }

    putRecords(records) {
        return new Promise((resolve, reject) => {

            records.forEach(record => {

                if (record.type === "customer.deleted") {
                    this.parentConfig.emit("model-delete", record.key.toString());
                    this.deletes.push(record.key);
                    return;
                }

                this.upserts.push(record.value);
                this.parentConfig.emit("model-upsert", record.key.toString());
            });

            if (this.upserts.length + this.deletes.length < this.batchSize) {
                this._stats.currentDeletesBuferLength = this.deletes.length;
                this._stats.currentUpsertsBufferLength = this.upserts.length;
                return resolve();
            }

            const upserts = this.upserts.splice(0, this.batchSize);
            const deletes = this.deletes.splice(0, this.batchSize);

            this._stats.currentDeletesBuferLength = this.deletes.length;
            this._stats.currentUpsertsBufferLength = this.upserts.length;

            async.parallel(
                [
                    done => this._upsert(upserts, done),
                    done => this._delete(deletes, done)
                ],
                (error) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve();
                }
            );
        });
    }

    put(records, callback) {
        this.putRecords(records)
            .then(() => callback(null))
            .catch(error => callback(error));
    }

    stop() {
        //empty (connection is closed by connector)
    }
}

module.exports = SalesforceSinkTask;
