"use strict";

const SalesforceSourceConfig = require("./lib/SalesforceSourceConfig.js");
const SalesforceSinkConfig = require("./lib/SalesforceSinkConfig.js");

const SalesforceSourceConnector = require("./lib/source/SalesforceSourceConnector.js");
const SalesforceSinkConnector = require("./lib/sink/SalesforceSinkConnector.js");

const SalesforceSourceTask = require("./lib/source/SalesforceSourceTask.js");
const SalesforceSinkTask = require("./lib/sink/SalesforceSinkTask.js");

const { JsonConverter, ConverterFactory } = require("kafka-connect");

const runSourceConnector = (properties, converters = [], onError = null) => {

    const config = new SalesforceSourceConfig(properties,
        SalesforceSourceConnector,
        SalesforceSourceTask, [JsonConverter].concat(converters));

    if (onError) {
        config.on("error", onError);
    }

    return config.run().then(() => {
        return config;
    });
};

const runSinkConnector = (properties, converters = [], onError = null) => {

    const config = new SalesforceSinkConfig(properties,
        SalesforceSinkConnector,
        SalesforceSinkTask, [JsonConverter].concat(converters));

    if (onError) {
        config.on("error", onError);
    }

    return config.run().then(() => {
        return config;
    });
};

module.exports = {
    runSourceConnector,
    runSinkConnector,
    ConverterFactory
};
