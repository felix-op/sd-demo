package exceptions;

import jakarta.inject.Inject;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.hibernate.exception.DataException;
import services.Rfc7807Service;

@Provider
public class DataExceptionMapper implements ExceptionMapper<DataException> {

    @Inject
    Rfc7807Service rfc7807Service;

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(DataException e) {
        return rfc7807Service.badRequest(
                "Datos invalidos",
                "Alguno de los campos enviados no cumple con el formato o tamaño esperado por la base de datos.",
                uriInfo.getPath()
        );
    }
}
