package exceptions;

import jakarta.inject.Inject;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import services.Rfc7807Service;

@Provider
public class IllegalArgumentExceptionMapper implements ExceptionMapper<IllegalArgumentException> {

    @Inject
    Rfc7807Service rfc7807Service;

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(IllegalArgumentException e) {
        return rfc7807Service.badRequest("Parámetro inválido", e.getMessage(), uriInfo.getPath());
    }
}
