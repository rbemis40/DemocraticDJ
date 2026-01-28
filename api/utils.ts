export function typeSafeBind<T>(fn: T, thisArg: any): T {
    if (typeof fn !== "function"){
        throw Error("typeSafeBind: fn must be a function");
    }
    return fn.bind(thisArg);
}