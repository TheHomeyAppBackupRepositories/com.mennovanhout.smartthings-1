"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_sdk_1 = require("@smartthings/core-sdk");
const SmartThingsDriver_1 = __importDefault(require("../../shared/SmartThingsDriver"));
const SamsungceWashingCycle_1 = require("./SamsungceWashingCycle");
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
        // Set washing program
        this._setWashingProgram = this.homey.flow.getActionCard('set-washing-program');
        this._setWashingProgram.registerArgumentAutocompleteListener('program', async (query, args) => {
            const results = args.device.supportedWashingPrograms.map((program) => {
                return {
                    name: (0, SamsungceWashingCycle_1.getLogicalName)(program),
                    id: program,
                };
            });
            return results.filter((result) => {
                return result.name.toLowerCase().includes(query.toLowerCase());
            });
        });
        this._setWashingProgram.registerRunListener(async (args, state) => {
            await this.setWashingProgram(args.device, args.program);
        });
        // Set waching machine state
        this._setWasherMachineState = this.homey.flow.getActionCard('set-washer-machine-state');
        this._setWasherMachineState.registerRunListener(async (args, state) => {
            await this.setWashingMachineState(args.device, args.washer_machine_state);
        });
        this.deviceAPI = new core_sdk_1.SmartThingsClient(new core_sdk_1.BearerTokenAuthenticator(this.homey.settings.get('token')));
    }
    setWashingProgram(device, program) {
        return new Promise((resolve, reject) => {
            this.deviceAPI.devices.executeCommand(device.getData().id, {
                capability: 'samsungce.washerCycle',
                command: 'setWasherCycle',
                arguments: [`Course_${program.id.slice(program.id.lastIndexOf('_') + 1)}`],
            }).then((responese) => {
                this.log(responese);
                resolve(true);
            }).catch((error) => {
                this.log(error, error.response);
                reject();
            });
        });
    }
    setWashingMachineState(device, state) {
        return new Promise((resolve, reject) => {
            this.deviceAPI.devices.executeCommand(device.getData().id, {
                capability: 'washerOperatingState',
                command: 'setMachineState',
                arguments: [state],
            }).then((responese) => {
                this.log(responese);
                resolve(true);
            }).catch((error) => {
                this.log(error, error.response);
                reject();
            });
        });
    }
    triggerWasherJobBecameFlow(device, tokens, state) {
        this._deviceJobStateBecame?.trigger(device, tokens, state).then(this.log).catch(this.error);
    }
    triggerWasherStateBecameFlow(device, tokens, state) {
        this._deviceMachineStateBecame?.trigger(device, tokens, state).then(this.log).catch(this.error);
    }
}
module.exports = Driver;
