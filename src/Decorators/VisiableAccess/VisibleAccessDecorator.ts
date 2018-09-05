import { CONFIGURATION } from "../../Configuration/Configuration";

/** Устанавливает право на чтение для поля по AccessRule текущего пользователя */
export function VisibleAccess(accessRule: string | string[]) {
    return (target: {}, propertyKey: string) => {
        if (!target[CONFIGURATION.AccessProxyVisibleRulesName]) {
            target[CONFIGURATION.AccessProxyVisibleRulesName] = {};
        }
        target[CONFIGURATION.AccessProxyVisibleRulesName][propertyKey] = accessRule;
    };
}