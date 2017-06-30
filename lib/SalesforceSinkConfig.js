"use strict";

const {SinkConfig} = require("kafka-connect");

class SalesforceSinkConfig extends SinkConfig {

    constructor(...args){ super(...args); }

    run(){
        return super.run();
    }
}

module.exports = SalesforceSinkConfig;
