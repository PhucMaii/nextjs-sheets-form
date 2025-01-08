import '@testing-library/jest-dom';

// jest.setup.js
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
