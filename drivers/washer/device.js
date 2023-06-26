"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_1 = __importDefault(require("homey"));
class Device extends homey_1.default.Device {
    async updateInformation() {
        const { id } = this.getData();
        // @ts-ignore
        this.driver.deviceAPI.devices.getStatus(id).then((status) => {
            const oldWasherJobState = this.getCapabilityValue('washer_job_state');
            const oldWasherMachineState = this.getCapabilityValue('washer_machine_state');
            const washerJobState = status.components.main.washerOperatingState.washerJobState.value;
            const washerMachineState = status.components.main.washerOperatingState.machineState.value;
            this.setCapabilityValue('washer_job_state', washerJobState).catch(this.error);
            this.setCapabilityValue('washer_machine_state', washerMachineState).catch(this.error);
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
        }).catch((error) => {
            this.log(error, 'something went wrong while updating information');
        });
    }
    async onInit() {
        this.driver.ready().then(() => {
            this.updateInformation();
            this.interval = setInterval(() => this.updateInformation(), 5000);
        });
    }
    async onDeleted() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
module.exports = Device;
