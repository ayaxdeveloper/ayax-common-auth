import { CONFIGURATION } from "../../Configuration/Configuration";

export function VisibleAccess(accessRule: string | string[]) {
    return (target: {}, propertyKey: string) => {
        if (!target[CONFIGURATION.AccessProxyVisibleRulesName]) {
            target[CONFIGURATION.AccessProxyVisibleRulesName] = {};
        }
        target[CONFIGURATION.AccessProxyVisibleRulesName][propertyKey] = accessRule;
    };
}