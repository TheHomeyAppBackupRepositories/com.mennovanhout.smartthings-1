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
            const oldDryerJobState = this.getCapabilityValue('dryer_job_state');
            const oldDryerMachineState = this.getCapabilityValue('dryer_machine_state');
            const dryerJobState = status.components.main.dryerOperatingState.dryerJobState.value;
            const dryerMachineState = status.components.main.dryerOperatingState.machineState.value;
            this.setCapabilityValue('dryer_job_state', dryerJobState).catch(this.error);
            this.setCapabilityValue('dryer_machine_state', dryerMachineState).catch(this.error);
            if (oldDryerJobState !== dryerJobState) {
                // @ts-ignore
                this.driver.triggerDryerJobBecameFlow(this, {
                    dryer_job_state: dryerJobState,
                }, {
                    dryer_job_state: dryerJobState,
                });
            }
            if (oldDryerMachineState !== dryerMachineState) {
                // @ts-ignore
                this.driver.triggerDryerStateBecameFlow(this, {
                    dryer_machine_state: dryerMachineState,
                }, {
                    dryer_machine_state: dryerMachineState,
                });
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
