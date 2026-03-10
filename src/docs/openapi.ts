export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "DamDam API",
    version: "1.0.0",
    description: "REST API documentation for DamDam backend.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Health", description: "Service health checks" },
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Users", description: "User profile endpoints" },
    { name: "Products", description: "Product catalog endpoints" },
    { name: "Cart", description: "Shopping cart endpoints" },
    { name: "Orders", description: "Order endpoints" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Validation failed" },
          details: { type: "object", nullable: true },
        },
      },
      UserPublic: {
        type: "object",
        properties: {
          id: { type: "string", example: "65f1a3e5b07a4f5df6b913b2" },
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane@example.com" },
          role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
        },
      },
      Product: {
        type: "object",
        properties: {
          _id: { type: "string", example: "65f1a3e5b07a4f5df6b913b2" },
          name: { type: "string", example: "iPhone 15" },
          description: { type: "string", example: "Latest Apple smartphone" },
          price: { type: "number", example: 1299 },
          stock: { type: "number", example: 40 },
          category: { type: "string", example: "phones" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductListMeta: {
        type: "object",
        properties: {
          total: { type: "integer", example: 37 },
          pages: { type: "integer", example: 4 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          hasNextPage: { type: "boolean", example: true },
          hasPreviousPage: { type: "boolean", example: false },
        },
      },
      ProductListResponse: {
        type: "object",
        properties: {
          products: {
            type: "array",
            items: { $ref: "#/components/schemas/Product" },
          },
          meta: {
            $ref: "#/components/schemas/ProductListMeta",
          },
        },
      },
      CreateProductRequest: {
        type: "object",
        required: ["name", "price", "stock"],
        properties: {
          name: { type: "string", example: "iPhone 15" },
          description: { type: "string", example: "Latest Apple smartphone" },
          price: { type: "number", minimum: 0, example: 1299 },
          stock: { type: "integer", minimum: 0, example: 20 },
          category: { type: "string", example: "phones" },
        },
      },
      UpdateProductRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "iPhone 15 Pro" },
          description: { type: "string", example: "Updated description" },
          price: { type: "number", minimum: 0, example: 1499 },
          stock: { type: "integer", minimum: 0, example: 15 },
          category: { type: "string", example: "phones" },
          isActive: { type: "boolean", example: true },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane@example.com" },
          password: { type: "string", minLength: 8, example: "password123" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "jane@example.com" },
          password: { type: "string", example: "password123" },
        },
      },
      RegisterResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Registration successful. Please login." },
          user: { $ref: "#/components/schemas/UserPublic" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI..." },
          user: { $ref: "#/components/schemas/UserPublic" },
        },
      },
      MessageResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Logged out successfully" },
        },
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "jane@example.com" },
        },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["email", "otp", "newPassword"],
        properties: {
          email: { type: "string", format: "email", example: "jane@example.com" },
          otp: { type: "string", example: "123456" },
          newPassword: { type: "string", minLength: 8, example: "newpassword123" },
        },
      },
      UserProfileResponse: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              _id: { type: "string", example: "65f1a3e5b07a4f5df6b913b2" },
              name: { type: "string", example: "Jane Doe" },
              email: { type: "string", format: "email", example: "jane@example.com" },
              role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
              isSuspended: { type: "boolean", example: false },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
      CreateAdminRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Admin User" },
          email: { type: "string", format: "email", example: "admin@example.com" },
          password: { type: "string", minLength: 8, example: "strongpassword123" },
        },
      },
      CartItem: {
        type: "object",
        properties: {
          productId: {
            type: "object",
            properties: {
              _id: { type: "string", example: "65f1a3e5b07a4f5df6b913b2" },
              name: { type: "string", example: "iPhone 15" },
              price: { type: "number", example: 1299 },
              stock: { type: "number", example: 20 },
              isActive: { type: "boolean", example: true },
            },
          },
          quantity: { type: "integer", minimum: 1, example: 2 },
        },
      },
      Cart: {
        type: "object",
        properties: {
          _id: { type: "string", example: "65f1a3e5b07a4f5df6b913c3" },
          user: { type: "string", example: "65f1a3e5b07a4f5df6b913b2" },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/CartItem" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CartResponse: {
        type: "object",
        properties: {
          cart: {
            oneOf: [
              { $ref: "#/components/schemas/Cart" },
              {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: { $ref: "#/components/schemas/CartItem" },
                  },
                },
              },
            ],
          },
        },
      },
      AddCartItemRequest: {
        type: "object",
        required: ["productId", "quantity"],
        properties: {
          productId: { type: "string", example: "65f1a3e5b07a4f5df6b913b2" },
          quantity: { type: "integer", minimum: 1, example: 1 },
        },
      },
      UpdateCartItemRequest: {
        type: "object",
        required: ["quantity"],
        properties: {
          quantity: { type: "integer", minimum: 1, example: 3 },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          productId: { type: "string", example: "65f1a3e5b07a4f5df6b913b2" },
          name: { type: "string", example: "iPhone 15" },
          unitPrice: { type: "number", example: 1299 },
          quantity: { type: "integer", example: 1 },
          lineTotal: { type: "number", example: 1299 },
        },
      },
      Order: {
        type: "object",
        properties: {
          _id: { type: "string", example: "65f1a3e5b07a4f5df6b913d4" },
          user: { type: "string", example: "65f1a3e5b07a4f5df6b913b2" },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderItem" },
          },
          subtotal: { type: "number", example: 1299 },
          shippingFee: { type: "number", example: 0 },
          totalAmount: { type: "number", example: 1299 },
          status: {
            type: "string",
            enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
            example: "PENDING",
          },
          paymentStatus: { type: "string", enum: ["UNPAID", "PAID"], example: "UNPAID" },
          notes: { type: "string", example: "Deliver before 5pm" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      OrderResponse: {
        type: "object",
        properties: {
          order: { $ref: "#/components/schemas/Order" },
        },
      },
      OrdersResponse: {
        type: "object",
        properties: {
          orders: {
            type: "array",
            items: { $ref: "#/components/schemas/Order" },
          },
        },
      },
      CreateOrderRequest: {
        type: "object",
        properties: {
          notes: { type: "string", example: "Leave at the front desk" },
        },
      },
      UpdateOrderStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
            example: "SHIPPED",
          },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "API is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Registration successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/google": {
      get: {
        tags: ["Auth"],
        summary: "Start Google OAuth sign-in",
        description: "Redirects the user to Google OAuth consent screen.",
        responses: {
          "302": {
            description: "Redirect to Google",
          },
          "500": {
            description: "Google OAuth is not configured",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/google/callback": {
      get: {
        tags: ["Auth"],
        summary: "Google OAuth callback",
        description:
          "On success, sets refresh cookie and redirects to frontend success URL. On failure, redirects to failure URL.",
        responses: {
          "302": {
            description: "Redirect to frontend URL",
          },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Rotate refresh token and return new access token",
        description: "Requires refresh token cookie set by login endpoint.",
        responses: {
          "200": {
            description: "Token refresh successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "401": {
            description: "Missing or invalid refresh token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout current session",
        responses: {
          "200": {
            description: "Logout successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request password reset OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ForgotPasswordRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Generic success message",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password with OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
              },
            },
          },
          "400": {
            description: "Invalid or expired OTP",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current authenticated user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserProfileResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/users/create-admin": {
      post: {
        tags: ["Users"],
        summary: "Create a new admin user (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAdminRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Admin created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Admin account created successfully" },
                    user: { $ref: "#/components/schemas/UserPublic" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List products with filtering, sorting, and pagination",
        description:
          "Supports multi-category filtering, price range, keyword search, sorting, and paginated metadata.",
        parameters: [
          {
            name: "category",
            in: "query",
            description: "Comma-separated categories (example: electronics,phones)",
            schema: { type: "string", example: "electronics,phones" },
          },
          {
            name: "minPrice",
            in: "query",
            schema: { type: "number", example: 100 },
          },
          {
            name: "maxPrice",
            in: "query",
            schema: { type: "number", example: 2000 },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string", example: "iphone" },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, example: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, example: 10, default: 10 },
          },
          {
            name: "sort",
            in: "query",
            description: "Sort fields separated by commas. Prefix with '-' for descending.",
            schema: { type: "string", example: "-price,createdAt" },
          },
        ],
        responses: {
          "200": {
            description: "Filtered products",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductListResponse" },
              },
            },
          },
          "400": {
            description: "Invalid query parameters",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProductRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Product created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Product found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Products"],
        summary: "Update product (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProductRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Product updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    product: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Product deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
              },
            },
          },
        },
      },
    },
    "/api/products/admin/all": {
      get: {
        tags: ["Products"],
        summary: "List all products including inactive (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "All products",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    products: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get current user's cart",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Cart details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartResponse" },
              },
            },
          },
        },
      },
    },
    "/api/cart/items": {
      post: {
        tags: ["Cart"],
        summary: "Add item to cart",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddCartItemRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Cart updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartResponse" },
              },
            },
          },
        },
      },
    },
    "/api/cart/items/{productId}": {
      patch: {
        tags: ["Cart"],
        summary: "Update quantity for a cart item",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCartItemRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Cart updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Remove item from cart",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Cart updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartResponse" },
              },
            },
          },
        },
      },
    },
    "/api/cart/clear": {
      delete: {
        tags: ["Cart"],
        summary: "Clear all cart items",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Cart cleared",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartResponse" },
              },
            },
          },
        },
      },
    },
    "/api/orders": {
      post: {
        tags: ["Orders"],
        summary: "Create order from current user's cart",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOrderRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Order created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderResponse" },
              },
            },
          },
          "400": {
            description: "Cart empty or product unavailable",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/orders/my": {
      get: {
        tags: ["Orders"],
        summary: "List current user's orders",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Orders list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrdersResponse" },
              },
            },
          },
        },
      },
    },
    "/api/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get order by id (user owns order or admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Order details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderResponse" },
              },
            },
          },
          "404": {
            description: "Order not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/orders/admin/all": {
      get: {
        tags: ["Orders"],
        summary: "List all orders (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "All orders",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrdersResponse" },
              },
            },
          },
        },
      },
    },
    "/api/orders/admin/{id}/status": {
      patch: {
        tags: ["Orders"],
        summary: "Update order status (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateOrderStatusRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Order status updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderResponse" },
              },
            },
          },
          "400": {
            description: "Invalid status",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
} as const;
