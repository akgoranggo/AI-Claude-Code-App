/**
 * OpenAPI/Swagger Documentation
 *
 * Provides API documentation at /api/docs endpoint.
 */

import type { Express } from "express";
import swaggerUi from "swagger-ui-express";

/**
 * OpenAPI 3.0 Specification
 */
const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Web App Template API",
    description:
      "RESTful API for the enterprise web application template. Built with Express.js, TypeScript, and PostgreSQL.",
    version: "1.0.0",
    contact: {
      name: "API Support",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "/api",
      description: "Current API (unversioned)",
    },
    {
      url: "/api/v1",
      description: "API Version 1",
    },
  ],
  tags: [
    {
      name: "Health",
      description: "Health check endpoints for monitoring",
    },
    {
      name: "Auth",
      description: "Authentication endpoints",
    },
    {
      name: "Organizations",
      description: "Organization management endpoints",
    },
    {
      name: "Users",
      description: "User management endpoints",
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Basic health check",
        description: "Returns basic server health status",
        responses: {
          "200": {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse",
                },
              },
            },
          },
        },
      },
    },
    "/health/ready": {
      get: {
        tags: ["Health"],
        summary: "Readiness check",
        description:
          "Checks if the server is ready to accept requests (includes database connectivity)",
        responses: {
          "200": {
            description: "Server is ready",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ReadinessResponse",
                },
              },
            },
          },
          "503": {
            description: "Server is not ready",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ReadinessResponse",
                },
              },
            },
          },
        },
      },
    },
    "/health/live": {
      get: {
        tags: ["Health"],
        summary: "Liveness check",
        description: "Simple liveness probe for container orchestration",
        responses: {
          "200": {
            description: "Server is alive",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LivenessResponse",
                },
              },
            },
          },
        },
      },
    },
    "/auth/user": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        description: "Returns the currently authenticated user",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          "200": {
            description: "Current user information",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthUser",
                },
              },
            },
          },
          "401": {
            description: "Not authenticated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/organizations": {
      get: {
        tags: ["Organizations"],
        summary: "List all organizations",
        description: "Returns a list of all organizations",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          "200": {
            description: "List of organizations",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Organization",
                  },
                },
              },
            },
          },
          "401": {
            description: "Not authenticated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Organizations"],
        summary: "Create organization",
        description: "Creates a new organization",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateOrganization",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Organization created",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Organization",
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
              },
            },
          },
          "401": {
            description: "Not authenticated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "409": {
            description: "Organization already exists",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/organizations/{id}": {
      get: {
        tags: ["Organizations"],
        summary: "Get organization by ID",
        description: "Returns a single organization",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Organization ID (ULID)",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Organization found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Organization",
                },
              },
            },
          },
          "401": {
            description: "Not authenticated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "404": {
            description: "Organization not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Organizations"],
        summary: "Update organization",
        description: "Updates an existing organization",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Organization ID (ULID)",
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateOrganization",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Organization updated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Organization",
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
              },
            },
          },
          "401": {
            description: "Not authenticated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "404": {
            description: "Organization not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "409": {
            description: "Organization name already exists",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Organizations"],
        summary: "Delete organization",
        description: "Soft deletes an organization (sets isActive to false)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Organization ID (ULID)",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Organization deleted",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Organization",
                },
              },
            },
          },
          "401": {
            description: "Not authenticated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "404": {
            description: "Organization not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        description: "Returns a list of all users",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          "200": {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/User",
                  },
                },
              },
            },
          },
          "401": {
            description: "Not authenticated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        description: "Returns a single user",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "User ID",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "User found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          "401": {
            description: "Not authenticated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token from authentication provider",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "connect.sid",
        description: "Session cookie set after successful authentication",
      },
    },
    schemas: {
      HealthResponse: {
        type: "object",
        properties: {
          status: {
            type: "string",
            example: "healthy",
          },
          timestamp: {
            type: "string",
            format: "date-time",
          },
          uptime: {
            type: "number",
            description: "Server uptime in seconds",
          },
          version: {
            type: "string",
            example: "1.0.0",
            description: "Application version from package.json",
          },
        },
      },
      ReadinessResponse: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["ok", "error"],
          },
          timestamp: {
            type: "string",
            format: "date-time",
          },
          checks: {
            type: "object",
            properties: {
              database: {
                type: "string",
                enum: ["ok", "error"],
              },
            },
          },
        },
      },
      LivenessResponse: {
        type: "object",
        properties: {
          status: {
            type: "string",
            example: "ok",
          },
        },
      },
      AuthUser: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          email: {
            type: "string",
            format: "email",
          },
          firstName: {
            type: "string",
          },
          lastName: {
            type: "string",
          },
          profileImageUrl: {
            type: "string",
            format: "uri",
          },
        },
      },
      Organization: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ULID primary key",
          },
          name: {
            type: "string",
          },
          legalName: {
            type: "string",
            nullable: true,
          },
          taxId: {
            type: "string",
            nullable: true,
          },
          billingEmail: {
            type: "string",
            format: "email",
            nullable: true,
          },
          logoUrl: {
            type: "string",
            format: "uri",
            nullable: true,
          },
          timezone: {
            type: "string",
            default: "UTC",
          },
          isActive: {
            type: "boolean",
            default: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
          deletedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
        },
      },
      CreateOrganization: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
          },
          legalName: {
            type: "string",
            maxLength: 255,
          },
          taxId: {
            type: "string",
            maxLength: 50,
          },
          billingEmail: {
            type: "string",
            format: "email",
          },
          logoUrl: {
            type: "string",
            format: "uri",
          },
          timezone: {
            type: "string",
            default: "UTC",
          },
        },
      },
      UpdateOrganization: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
          },
          legalName: {
            type: "string",
            maxLength: 255,
          },
          taxId: {
            type: "string",
            maxLength: 50,
          },
          billingEmail: {
            type: "string",
            format: "email",
          },
          logoUrl: {
            type: "string",
            format: "uri",
          },
          timezone: {
            type: "string",
          },
          isActive: {
            type: "boolean",
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          email: {
            type: "string",
            format: "email",
          },
          firstName: {
            type: "string",
            nullable: true,
          },
          lastName: {
            type: "string",
            nullable: true,
          },
          profileImageUrl: {
            type: "string",
            format: "uri",
            nullable: true,
          },
          role: {
            type: "string",
            enum: ["user", "admin"],
            default: "user",
          },
          isActive: {
            type: "boolean",
            default: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
          code: {
            type: "string",
          },
          message: {
            type: "string",
          },
          requestId: {
            type: "string",
          },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
          code: {
            type: "string",
            example: "VALIDATION_ERROR",
          },
          message: {
            type: "string",
          },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Dot-separated path to the invalid field (e.g., 'user.email')",
                },
                message: {
                  type: "string",
                },
              },
            },
          },
          requestId: {
            type: "string",
          },
        },
      },
    },
  },
};

/**
 * Register OpenAPI documentation routes
 */
export function registerOpenApiRoutes(app: Express): void {
  // Serve Swagger UI at /api/docs
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Web App Template API Documentation",
    })
  );

  // Serve raw OpenAPI spec as JSON
  app.get("/api/docs.json", (_req, res) => {
    res.json(openApiSpec);
  });
}
