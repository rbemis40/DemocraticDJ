import { JSONSchemaType } from "ajv";

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