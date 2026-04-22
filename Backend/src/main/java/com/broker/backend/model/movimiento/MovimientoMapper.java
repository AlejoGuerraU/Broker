package com.broker.backend.model.movimiento;

import com.broker.backend.persistence.entity.MovimientoEntity;
import org.springframework.stereotype.Component;

@Component
public class MovimientoMapper {

    public MovimientoResponse toResponse(MovimientoEntity movimiento) {
        return new MovimientoResponse(
                movimiento.getId(),
                movimiento.getDescripcion(),
                movimiento.getCategoria().getNombre(),
                movimiento.getFecha().toLocalDate().toString(),
                movimiento.getCantidad().doubleValue(),
                mapMovimientoType(movimiento.getCategoria().getTipoMovimiento().getNombre())
        );
    }

    private MovimientoType mapMovimientoType(String tipoMovimiento) {
        return "ingreso".equalsIgnoreCase(tipoMovimiento) ? MovimientoType.income : MovimientoType.expense;
    }
}
