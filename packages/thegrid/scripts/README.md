# Scripts

This directory contains utility scripts for TheGrid project.

## generate-postman.ts

Generates OpenAPI specifications and Postman collections from converted routes.

### Usage

```bash
npm run generate-postman
```

### What it does

1. **Imports converted routes** - Currently includes:

   - `/api/agent/*` routes (from agent.ts)
   - `/api/files/*` routes (from files.ts)

2. **Generates OpenAPI spec** - Creates a complete OpenAPI 3.0 specification with:

   - Endpoint definitions
   - Request/response schemas
   - Authentication requirements
   - Server configurations

3. **Creates Postman collection** - Converts the OpenAPI spec to a Postman collection with:
   - Organized folders by API domain
   - Pre-configured variables (baseUrl, tokens)
   - Example requests and responses
   - Authentication headers

### Output

Files are saved to `packages/thegrid/generated/`:

- `openapi-spec.json` - Complete OpenAPI 3.0 specification
- `thegrid-api-collection.json` - Postman collection ready for import

### Adding new routes

To include new routes in the generated documentation:

1. **Convert route to OpenAPI format** using `@hono/zod-openapi`:

   ```ts
   import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
   import { z } from "zod";

   // Define schemas
   const ResponseSchema = z.object({
     success: z.boolean(),
     data: z.any(),
   });

   // Create route
   const route = createRoute({
     method: "get",
     path: "/my-endpoint",
     summary: "My endpoint",
     responses: {
       200: {
         content: { "application/json": { schema: ResponseSchema } },
         description: "Success response",
       },
     },
   });

   // Use in router
   router.openapi(route, async (c) => {
     // Your handler logic
     return c.json({ success: true, data: result });
   });
   ```

2. **Import the router** in `generate-postman.ts`:

   ```ts
   import { myRouter } from "../src/routes/api/my-domain/my-routes";

   // Mount in the app
   app.route("/api/my-domain", myRouter);
   ```

3. **Run the script** to regenerate:
   ```bash
   npm run generate-postman
   ```

### Benefits

- ✅ **Automatic documentation** - No manual OpenAPI writing
- ✅ **Type safety** - Zod schemas ensure request/response validation
- ✅ **Professional collections** - Production-ready Postman collections
- ✅ **Easy maintenance** - Single source of truth for API contracts
- ✅ **CI/CD ready** - Can be automated in deployment pipelines
