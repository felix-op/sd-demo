package exceptions;

import jakarta.inject.Inject;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import services.Rfc7807Service;

import java.util.NoSuchElementException;

@Provider
public class NoSuchElementExceptionMapper implements ExceptionMapper<NoSuchElementException> {
    @Inject
    Rfc7807Service rfc7807Service;

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(NoSuchElementException e) {
        return rfc7807Service.notFound("No encontrado", e.getMessage(), uriInfo.getPath());
    }
}
