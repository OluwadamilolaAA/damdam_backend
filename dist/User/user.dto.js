"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCreateAdminDto = void 0;
const api_error_1 = require("../utils/api-error");
const validators_1 = require("../utils/validators");
const parseCreateAdminDto = (body) => {
    const data = body;
    const password = (0, validators_1.requireString)(data.password, "password");
    if (password.length < 8) {
        throw new api_error_1.ApiError(400, "password must be at least 8 characters");
    }
    return {
        name: (0, validators_1.requireString)(data.name, "name"),
        email: (0, validators_1.requireEmail)(data.email),
        password,
    };
};
exports.parseCreateAdminDto = parseCreateAdminDto;
