"use strict";

const {SourceConfig} = require("kafka-connect");

class SalesforceSourceConfig extends SourceConfig {

    constructor(...args){ super(...args); }

    run(){
        return super.run();
    }
}

module.exports = SalesforceSourceConfig;
