export function loadVar(name: string): string {
    const value = process.env[name];
    if (value === undefined) {
        throw new Error(`Environment var ${name} not set!`);
    }

    return value;
}

export function loadVars(names: string[]): string[] {
    const errors: string[] = [];
    const values: string[] = [];
    for(const name of names) {
        try {
            values.push(loadVar(name));
        }
        catch (err) {
            errors.push(err);
        }
    }

    if (errors.length > 0) {
        throw new Error(errors.join("\n"));
    }

    return values;
}