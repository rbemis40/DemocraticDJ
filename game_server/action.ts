import Ajv, { JSONSchemaType } from "ajv";

const ajv = new Ajv.Ajv();

export type Action<T extends object> = {
    action: string,
    data: T
};

export function buildActionSchema<T extends object>(name: string, dataSchema: JSONSchemaType<T>): JSONSchemaType<Action<T>> {
    return {
        type: "object",
        properties: {
            action: {
                type: "string",
                const: name
            },
            data: dataSchema
        },
        required: ["action", "data"],
    } as JSONSchemaType<Action<T>>;
}

export const actionSchema: JSONSchemaType<Action<object>> = {
    type: 'object',
    properties: {
        action: {type: 'string'},
        data: {type: 'object'}
    },
    required: ['action', 'data'],
    additionalProperties: false
};

export function isAction(data: unknown): data is Action<object> {
    return ajv.validate(actionSchema, data);
}