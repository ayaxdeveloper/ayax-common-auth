import { CONFIGURATION } from "../../Configuration/Configuration";

/** Устанавливает право на запись для поля по AccessRule текущего пользователя */
export function WritableAccess(accessRule: string | string[]) {
    return (target: {}, propertyKey: string) => {
        if (!target[CONFIGURATION.AccessProxyWritableRulesName]) {
            target[CONFIGURATION.AccessProxyWritableRulesName] = {};
        }
        target[CONFIGURATION.AccessProxyWritableRulesName][propertyKey] = accessRule;
    };
}