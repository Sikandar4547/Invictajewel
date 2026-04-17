using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace InvictaJewel.API.Swagger;

/// <summary>
/// Swagger operation filter to properly handle IFormFile file upload parameters.
/// </summary>
public class SwaggerFileUploadFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Check if this action has IFormFile parameter
        var hasFileUpload = context.MethodInfo
            .GetParameters()
            .Any(p => p.ParameterType == typeof(IFormFile));

        if (!hasFileUpload) 
            return;

        // Clear existing parameters
        operation.Parameters.Clear();

        // Setup multipart/form-data request body
        operation.RequestBody = new OpenApiRequestBody
        {
            Required = true,
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties = new Dictionary<string, OpenApiSchema>
                        {
                            ["file"] = new OpenApiSchema
                            {
                                Type = "string",
                                Format = "binary",
                                Description = "File to upload"
                            }
                        },
                        Required = new HashSet<string> { "file" }
                    }
                }
            }
        };
    }
}
