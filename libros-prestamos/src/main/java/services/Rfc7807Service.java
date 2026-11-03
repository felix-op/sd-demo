package services;

import dtos.Rfc7807DTO;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
public class Rfc7807Service {
    public Response rfcResponse(int status, String title, String details, String instance) {
        return Response.status(status).entity(new Rfc7807DTO(status, title, details, instance)).build();
    }

    public Response badRequest(String title, String details, String instance) {
        return rfcResponse(400, title, details, instance);
    }

    public Response notFound(String title, String details, String instance) {
        return rfcResponse(404, title, details, instance);
    }

    public Response conflict(String title, String details, String instance) {
        return rfcResponse(409, title, details, instance);
    }

    public Response unauthorized(String title, String details, String instance) {
        return rfcResponse(401, title, details, instance);
    }

    public Response forbidden(String title, String details, String instance) {
        return rfcResponse(403, title, details, instance);
    }

    public Response internalServer(String title, String details, String instance) {
        return rfcResponse(500, title, details, instance);
    }
}
