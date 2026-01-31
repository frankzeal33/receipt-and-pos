import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0", // OpenAPI version
    info: {
      title: "Zeal Receipt",
      version: "1.0.0",
      description: "API documentation for my zeal receipt backend",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local development server"
      },
      {
        url: "https://api.myapp.com/v1",
        description: "Remote Production server"
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Authentication and authorization endpoints",
        externalDocs: {
          description: "Find out more",
          url: "https://example.com"
        }
      },
      {
        name: "Products",
        description: "Add products",
      },
    ],
  },
  apis: process.env.NODE_ENV === "production"
    ? ["./dist/controllers/*.js"]  // prod: compiled files
    : ["./src/controllers/*.ts"],  // dev: TypeScript source
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
