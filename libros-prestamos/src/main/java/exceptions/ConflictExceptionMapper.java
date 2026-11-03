package exceptions;

import jakarta.inject.Inject;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import services.Rfc7807Service;

@Provider
public class ConflictExceptionMapper implements ExceptionMapper<ConflictException> {

    @Inject
    Rfc7807Service rfc7807Service;

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(ConflictException e) {
        return rfc7807Service.conflict("Conflicto", e.getMessage(), uriInfo.getPath());
    }
}
