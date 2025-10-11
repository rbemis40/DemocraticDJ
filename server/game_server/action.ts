import { JSONSchemaType } from "ajv";

export type Action<T extends object> = {
    name: string,
    data: T
};

export const actionSchema: JSONSchemaType<Action<object>> = {
    type: 'object',
    properties: {
        name: {type: 'string'},
        data: {type: 'object'}
    },
    required: ['name', 'data'],
    additionalProperties: false
};