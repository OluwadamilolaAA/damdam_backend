"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCreateAdminDto = void 0;
const zod_1 = require("zod");
const zod_2 = require("../utils/zod");
const createAdminSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "name is required"),
    email: zod_1.z.string().trim().email("A valid email is required").toLowerCase(),
    password: zod_1.z.string().trim().min(8, "password must be at least 8 characters"),
});
const parseCreateAdminDto = (body) => {
    return (0, zod_2.parseWithSchema)(createAdminSchema, body);
};
exports.parseCreateAdminDto = parseCreateAdminDto;
