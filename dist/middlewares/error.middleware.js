"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
const api_error_1 = require("../utils/api-error");
const notFound = (_req, _res, next) => {
    next(new api_error_1.ApiError(404, "Route not found"));
};
exports.notFound = notFound;
const errorHandler = (error, _req, res, _next) => {
    if (error instanceof api_error_1.ApiError) {
        res.status(error.statusCode).json({
            message: error.message,
            details: error.details,
        });
        return;
    }
    console.error(error);
    res.status(500).json({
        message: "Internal server error",
    });
};
exports.errorHandler = errorHandler;
