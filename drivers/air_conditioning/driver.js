"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_sdk_1 = require("@smartthings/core-sdk");
const SmartThingsDriver_1 = __importDefault(require("../../shared/SmartThingsDriver"));
class Driver extends SmartThingsDriver_1.default {
    async onInit() {
        this.requiredCapabilities = ['airConditionerMode'];
        // When became flow cards
        this._deviceModeBecame = this.homey.flow.getDeviceTriggerCard('when_air_conditioning_mode_became');
        this._deviceModeBecame.registerRunListener(async (args, state) => {
            return args.air_conditioning_mode === state.air_conditioning_mode;
        });
        this._deviceFanModeBecame = this.homey.flow.getDeviceTriggerCard('when_air_conditioning_fan_mode_became');
        this._deviceFanModeBecame.registerRunListener(async (args, state) => {
            return args.air_conditioning_fan_mode === state.air_conditioning_fan_mode;
        });
        this._deviceFanOscillationModeBecame = this.homey.flow.getDeviceTriggerCard('when_air_conditioning_fan_oscillation_mode_became');
        this._deviceFanOscillationModeBecame.registerRunListener(async (args, state) => {
            return args.air_conditioning_fan_oscillation_mode === state.air_conditioning_fan_oscillation_mode;
        });
        // Is in ... flow cards
        this._deviceIsInMode = this.homey.flow.getConditionCard('air_conditioning_mode_is');
        this._deviceIsInMode.registerRunListener(async (args, state) => {
            return args.air_conditioning_mode === args.device.getCapabilityValue('air_conditioning_mode');
        });
        this._deviceIsInFanMode = this.homey.flow.getConditionCard('air_conditioning_fan_mode_is');
        this._deviceIsInFanMode.registerRunListener(async (args, state) => {
            return args.air_conditioning_fan_mode === args.device.getCapabilityValue('air_conditioning_fan_mode');
        });
        this._deviceIsInFanOscillationMode = this.homey.flow.getConditionCard('air_conditioning_fan_oscillation_mode_is');
        this._deviceIsInFanOscillationMode.registerRunListener(async (args, state) => {
            return args.air_conditioning_fan_oscillation_mode === args.device.getCapabilityValue('air_conditioning_fan_oscillation_mode');
        });
        // Set mode
        this._deviceSetMode = this.homey.flow.getActionCard('set_air_conditioning_mode');
        this._deviceSetMode.registerRunListener(async (args, state) => {
            this.setMyAirConditioningMode(args.device.getData().id, args.air_conditioning_mode);
        });
        this._deviceSetFanMode = this.homey.flow.getActionCard('set_air_conditioning_fan_mode');
        this._deviceSetFanMode.registerRunListener(async (args, state) => {
            this.setMyAirConditioningFanMode(args.device.getData().id, args.air_conditioning_fan_mode);
        });
        this._deviceSetFanOscillationMode = this.homey.flow.getActionCard('set_air_conditioning_fan_oscillation_mode');
        this._deviceSetFanOscillationMode.registerRunListener(async (args, state) => {
            this.setMyAirConditioningFanOscillationMode(args.device.getData().id, args.air_conditioning_fan_oscillation_mode);
        });
        this.deviceAPI = new core_sdk_1.SmartThingsClient(new core_sdk_1.BearerTokenAuthenticator(this.homey.settings.get('token')));
    }
    setMyAirConditioningMode(id, newMode) {
        const device = this.getDevice({ id });
        device.setCapabilityValue('air_conditioning_mode', newMode).catch(this.error);
        // @ts-ignore
        device.startUpdateInterval();
        this.deviceAPI.devices.executeCommand(id, {
            capability: 'airConditionerMode',
            command: 'setAirConditionerMode',
            arguments: [newMode],
        }).then((response) => {
            // Trigger became card
            this.triggerAirConditioningModeBecameFlow(device, {
                air_conditioning_mode: newMode,
            }, {
                air_conditioning_mode: newMode,
            });
        }).catch((error) => {
            this.log(error, error.response);
        });
    }
    setMyAirConditioningFanMode(id, newMode) {
        const device = this.getDevice({ id });
        device.setCapabilityValue('air_conditioning_fan_mode', newMode).catch(this.error);
        // @ts-ignore
        device.startUpdateInterval();
        this.deviceAPI.devices.executeCommand(id, {
            capability: 'airConditionerFanMode',
            command: 'setFanMode',
            arguments: [newMode],
        }).then((response) => {
            // Trigger became card
            this.triggerAirConditioningFanModeBecameFlow(device, {
                air_conditioning_fan_mode: newMode,
            }, {
                air_conditioning_fan_mode: newMode,
            });
            this.log(response);
        }).catch((error) => {
            this.log(error, error.response);
        });
    }
    setMyAirConditioningFanOscillationMode(id, newMode) {
        const device = this.getDevice({ id });
        device.setCapabilityValue('air_conditioning_fan_oscillation_mode', newMode).catch(this.error);
        // @ts-ignore
        device.startUpdateInterval();
        this.deviceAPI.devices.executeCommand(id, {
            capability: 'fanOscillationMode',
            command: 'setFanOscillationMode',
            arguments: [newMode],
        }).then((response) => {
            // Trigger became card
            this.triggerAirConditioningFanOscillationModeBecameFlow(device, {
                air_conditioning_fan_oscillation_mode: newMode,
            }, {
                air_conditioning_fan_oscillation_mode: newMode,
            });
            this.log(response);
        }).catch((error) => {
            this.log(error, error.response);
        });
    }
    triggerAirConditioningModeBecameFlow(device, tokens, state) {
        this._deviceModeBecame.trigger(device, tokens, state).then(this.log).catch(this.error);
    }
    triggerAirConditioningFanModeBecameFlow(device, tokens, state) {
        this._deviceFanModeBecame.trigger(device, tokens, state).then(this.log).catch(this.error);
    }
    triggerAirConditioningFanOscillationModeBecameFlow(device, tokens, state) {
        this._deviceFanOscillationModeBecame.trigger(device, tokens, state).then(this.log).catch(this.error);
    }
}
module.exports = Driver;
