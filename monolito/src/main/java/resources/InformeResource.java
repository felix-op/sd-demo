package resources;

import dtos.InformeAtencionesDTO;
import dtos.InformeNoDevueltosDTO;
import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import services.InformeService;

import java.time.LocalDate;
import java.util.List;

@Path("/informes")
public class InformeResource {

    @Inject
    InformeService informeService;

    @GET
    @Path("/no-devueltos")
    @Produces(MediaType.APPLICATION_JSON)
    public List<InformeNoDevueltosDTO> noDevueltos(
            @QueryParam("fechaInicio") String fechaInicio,
            @QueryParam("fechaFin") String fechaFin,
            @QueryParam("estado") @DefaultValue("ambos") String estado // vencidos | noVencidos | ambos
    ) {
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        var inicio = (fechaInicio == null || fechaInicio.isBlank()) ? LocalDate.MIN : LocalDate.parse(fechaInicio);
        var fin = (fechaFin == null || fechaFin.isBlank()) ? LocalDate.MAX : LocalDate.parse(fechaFin);

        return informeService.noDevueltos(inicio, fin, estado);
    }

    @GET
    @Path("/atenciones")
    @Produces(MediaType.APPLICATION_JSON)
    public List<InformeAtencionesDTO> atenciones(
            @QueryParam("fechaInicio") String fechaInicio,
            @QueryParam("fechaFin") String fechaFin,
            @QueryParam("atendidoPor") String atendidoPor
    ) {
        var inicio = (fechaInicio == null || fechaInicio.isBlank()) ? LocalDate.MIN : LocalDate.parse(fechaInicio);
        var fin = (fechaFin == null || fechaFin.isBlank()) ? LocalDate.MAX : LocalDate.parse(fechaFin);

        return informeService.atenciones(inicio, fin, atendidoPor);
    }

    @GET 
    public Response informes() {
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"title\": \"Informe no implementado \", \"details\": \"Sólo existen /atenciones y /no-devueltos\", \"status\": \"500\", \"instance\": \"/informes\"}")
                .build();
    }
}
