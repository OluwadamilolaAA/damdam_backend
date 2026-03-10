"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const openapi_1 = require("../docs/openapi");
const router = (0, express_1.Router)();
router.get("/docs.json", (_req, res) => {
    res.status(200).json(openapi_1.openApiSpec);
});
router.get("/docs", (_req, res) => {
    res
        .status(200)
        .type("html")
        .send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DamDam API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/api/docs.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    </script>
  </body>
</html>`);
});
exports.default = router;
