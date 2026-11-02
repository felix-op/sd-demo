package exceptions;

import jakarta.inject.Inject;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.hibernate.exception.ConstraintViolationException;
import services.Rfc7807Service;

@Provider
public class ConstraintViolationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {

    @Inject
    Rfc7807Service rfc7807Service;

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(ConstraintViolationException e) {
        return rfc7807Service.conflict(
                "Conflicto con datos existentes",
                "La operación no se pudo completar porque entra en conflicto con otro registro (por ejemplo, una referencia que todavía lo usa).",
                uriInfo.getPath()
        );
    }
}
