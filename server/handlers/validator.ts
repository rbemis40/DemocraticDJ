import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";

export interface ValidatorPair<SchemaType, ContextType> {
    schema: JSONSchemaType<SchemaType>;
    handler: (data: SchemaType, context: ContextType) => void;
}

interface CompiledPair<SchemaType, ContextType> {
    validate: ValidateFunction<SchemaType>;
    handler: (data: SchemaType, context: ContextType) => void;
}

export class Validator<ContextType> {
    private ajv: Ajv;
    private pairs: CompiledPair<unknown, ContextType>[];
    constructor() {
        this.ajv = new Ajv();
        this.pairs = []
    }

    addPair<SchemaType>(pair: ValidatorPair<SchemaType, ContextType>) {
        this.pairs.push({
            validate: this.ajv.compile(pair.schema),
            handler: pair.handler
        });
    }

    validateAndHandle(data: unknown, context: ContextType) {
        //console.log(`Validator.validateAndHandle: `);
        //console.log(data);
        this.pairs.forEach(pair => { 
            if(pair.validate(data)) {
                pair.handler(data, context);
            }
        });

        return null;
    }
}