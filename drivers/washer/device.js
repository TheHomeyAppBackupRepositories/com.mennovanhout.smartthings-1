"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_1 = __importDefault(require("homey"));
const SamsungceWashingCycle_1 = require("./SamsungceWashingCycle");
class Device extends homey_1.default.Device {
    constructor() {
        super(...arguments);
        this.supportedWashingPrograms = [];
    }
    async updateInformation() {
        const { id } = this.getData();
        // @ts-ignore
        this.driver.deviceAPI.devices.getStatus(id).then(async (status) => {
            const isOn = status.components.main.switch.switch.value === 'on';
            const oldWasherJobState = this.getCapabilityValue('washer_job_state');
            const oldWasherMachineState = this.getCapabilityValue('washer_machine_state');
            const washerJobState = status.components.main.washerOperatingState.washerJobState.value;
            const washerMachineState = status.components.main.washerOperatingState.machineState.value;
            this.setCapabilityValue('washer_job_state', washerJobState).catch(this.error);
            this.setCapabilityValue('washer_machine_state', washerMachineState).catch(this.error);
            this.setCapabilityValue('onoff', isOn).catch(this.error);
            const referenceTable = status.components.main['samsungce.washerCycle']?.referenceTable.value.id;
            this.supportedWashingPrograms = status.components.main['samsungce.washerCycle']?.supportedCycles.value.map((cycle) => `${referenceTable}_Course_${cycle.cycle}`);
            const currentProgram = status.components.main['samsungce.washerCycle']?.washerCycle.value;
            if (oldWasherJobState !== washerJobState) {
                // @ts-ignore
                this.driver.triggerWasherJobBecameFlow(this, {
                    washer_job_state: washerJobState,
                }, {
                    washer_job_state: washerJobState,
                });
            }
            if (oldWasherMachineState !== washerMachineState) {
                // @ts-ignore
                this.driver.triggerWasherStateBecameFlow(this, {
                    washer_machine_state: washerMachineState,
                }, {
                    washer_machine_state: washerMachineState,
                });
            }
            if (this.supportedWashingPrograms !== undefined) {
                if (!this.hasCapability('samsungce_washer_cycle')) {
                    await this.addCapability('samsungce_washer_cycle');
                }
                this.setCapabilityValue('samsungce_washer_cycle', (0, SamsungceWashingCycle_1.getLogicalName)(currentProgram)).catch(this.error);
            }
        }).catch((error) => {
            if (error.response?.status === 403) {
                this.setUnavailable('Device unavailable');
                return;
            }
            this.log(error, 'something went wrong while updating information');
        });
    }
    async onInit() {
        const { id } = this.getData();
        this.driver.ready().then(() => {
            if (!this.hasCapability('onoff')) {
                this.addCapability('onoff');
            }
            this.updateInformation();
            this.interval = setInterval(() => this.updateInformation(), 5000);
            // When turned on/off
            this.registerCapabilityListener('onoff', (on) => {
                // @ts-ignore
                this.driver.deviceAPI.devices.executeCommand(id, {
                    capability: 'switch',
                    command: on ? 'on' : 'off',
                }).then((response) => {
                    this.log(response);
                }).catch((error) => {
                    this.log(error, error.response);
                });
            });
        });
    }
    async onDeleted() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
module.exports = Device;
