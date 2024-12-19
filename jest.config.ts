import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
    },
}

export default config