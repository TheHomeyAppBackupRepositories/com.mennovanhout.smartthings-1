"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_1 = __importDefault(require("homey"));
const core_sdk_1 = require("@smartthings/core-sdk");
class SmartThingsDriver extends homey_1.default.Driver {
    constructor() {
        super(...arguments);
        this.requiredCapabilities = [];
    }
    async onPair(session) {
        session.setHandler('showView', async (view) => {
            if (view === 'loading') {
                try {
                    await this.deviceAPI.devices.list();
                    await session.showView('list_devices');
                }
                catch (error) {
                    await session.showView('personal-access-token');
                }
            }
            if (view === 'personal-access-token') {
                const token = this.homey.settings.get('token');
                await session.emit('token', token);
            }
        });
        // When personal access token is entered
        session.setHandler('save-token', async (token) => {
            this.homey.settings.set('token', token);
            this.deviceAPI = new core_sdk_1.SmartThingsClient(new core_sdk_1.BearerTokenAuthenticator(token));
            await session.showView('list_devices');
        });
        // When personal access token is accepted
        session.setHandler('list_devices', async () => {
            let devices = [];
            devices = await this.deviceAPI.devices.list({
                capability: this.requiredCapabilities,
            });
            return devices.map((item) => {
                return {
                    name: item.label,
                    data: {
                        id: item.deviceId,
                    },
                };
            });
        });
    }
}
exports.default = SmartThingsDriver;
