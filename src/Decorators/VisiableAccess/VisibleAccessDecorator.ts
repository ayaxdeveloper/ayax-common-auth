export function VisibleAccess(accessRule: string | string[]) {
    return (target: {}, propertyKey: string) => {
        if (this["__visible__"]) {
            this["__visible__"][propertyKey] = accessRule;
        }
    };
}