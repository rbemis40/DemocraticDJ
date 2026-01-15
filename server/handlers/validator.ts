import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";

export interface ValidatorPair<SchemaType, ContextType, ReturnType> {
    schema: JSONSchemaType<SchemaType>;
    handler: (data: SchemaType, context: ContextType) => ReturnType;
}

interface CompiledPair<SchemaType, ContextType, ReturnType> {
    validate: ValidateFunction<SchemaType>;
    handler: (data: SchemaType, context: ContextType) => ReturnType;
}

export class Validator<ReturnType, ContextType> {
    private ajv: Ajv;
    private pairs: CompiledPair<unknown, ContextType, ReturnType>[];
    constructor() {
        this.ajv = new Ajv();
        this.pairs = []
    }

    addPair<SchemaType>(pair: ValidatorPair<SchemaType, ContextType, ReturnType>) {
        this.pairs.push({
            validate: this.ajv.compile(pair.schema),
            handler: pair.handler
        });
    }

    validateAndHandle(data: unknown, context: ContextType): ReturnType | null {
        //console.log(`Validator.validateAndHandle: `);
        //console.log(data);
        this.pairs.forEach(pair => { 
            if(pair.validate(data)) {
                return pair.handler(data, context);
            }
        });

        return null;
    }
}