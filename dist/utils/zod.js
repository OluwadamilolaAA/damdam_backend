"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWithSchema = void 0;
const zod_1 = require("zod");
const api_error_1 = require("./api-error");
const formatIssuePath = (path) => path.length > 0 ? `${path.map((segment) => String(segment)).join(".")} ` : "";
const parseWithSchema = (schema, input) => {
    try {
        return schema.parse(input);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const details = error.issues.map((issue) => ({
                path: issue.path.map((segment) => String(segment)).join("."),
                message: issue.message,
            }));
            const primary = error.issues[0];
            const message = primary
                ? `${formatIssuePath(primary.path)}${primary.message}`.trim()
                : "Invalid request data";
            throw new api_error_1.ApiError(400, message, details);
        }
        throw error;
    }
};
exports.parseWithSchema = parseWithSchema;
