"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_sdk_1 = require("@smartthings/core-sdk");
const SmartThingsDriver_1 = __importDefault(require("../../shared/SmartThingsDriver"));
class Driver extends SmartThingsDriver_1.default {
    async onInit() {
        this.requiredCapabilities = ['washerOperatingState'];
        // When washer job became flow card
        this._deviceJobStateBecame = this.homey.flow.getDeviceTriggerCard('when-the-washer-job-became');
        this._deviceJobStateBecame.registerRunListener(async (args, state) => {
            return args.washer_job_state === state.washer_job_state;
        });
        // When machine state became flow card
        this._deviceMachineStateBecame = this.homey.flow.getDeviceTriggerCard('when-the-washer-state-became');
        this._deviceMachineStateBecame.registerRunListener(async (args, state) => {
            return args.washer_machine_state === state.washer_machine_state;
        });
        // Is doing job ... flow card
        this._deviceIsDoingJob = this.homey.flow.getConditionCard('is-doing-job');
        this._deviceIsDoingJob.registerRunListener(async (args, state) => {
            return args.washer_job_state === args.device.getCapabilityValue('washer_job_state');
        });
        // Is in state ... flow card
        this._deviceIsInState = this.homey.flow.getConditionCard('is-in-state');
        this._deviceIsInState.registerRunListener(async (args, state) => {
            return args.washer_machine_state === args.device.getCapabilityValue('washer_machine_state');
        });
        this.deviceAPI = new core_sdk_1.SmartThingsClient(new core_sdk_1.BearerTokenAuthenticator(this.homey.settings.get('token')));
    }
    triggerWasherJobBecameFlow(device, tokens, state) {
        this._deviceJobStateBecame.trigger(device, tokens, state).then(this.log).catch(this.error);
    }
    triggerWasherStateBecameFlow(device, tokens, state) {
        this._deviceMachineStateBecame.trigger(device, tokens, state).then(this.log).catch(this.error);
    }
}
module.exports = Driver;
