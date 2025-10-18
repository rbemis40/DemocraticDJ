import { JSONSchemaType } from "ajv";

export type Action<T extends object> = {
    name: string,
    data: T
};

export function buildActionSchema<T extends object>(name: string, dataSchema: JSONSchemaType<T>): JSONSchemaType<Action<T>> {
    return {
        type: "object",
        properties: {
            name: {type: "string"},
            data: dataSchema
        },
        required: ["name", "data"],
    } as JSONSchemaType<Action<T>>;
}

export const actionSchema: JSONSchemaType<Action<object>> = {
    type: 'object',
    properties: {
        name: {type: 'string'},
        data: {type: 'object'}
    },
    required: ['name', 'data'],
    additionalProperties: false
};