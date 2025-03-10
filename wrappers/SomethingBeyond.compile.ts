import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/something_beyond.tact',
    options: {
        debug: true,
    },
};
