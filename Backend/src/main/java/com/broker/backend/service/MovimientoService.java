package com.broker.backend.service;

import com.broker.backend.exception.ResourceNotFoundException;
import com.broker.backend.model.movimiento.CreateMovimientoRequest;
import com.broker.backend.model.movimiento.MovimientoResponse;
import com.broker.backend.model.movimiento.MovimientoType;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class MovimientoService {

    private final AtomicLong idSequence = new AtomicLong(8);
    private final List<MovimientoResponse> movimientos = new ArrayList<>(List.of(
            new MovimientoResponse(1L, "Salario mensual", "Salario", "2026-02-28", 4500.0, MovimientoType.income),
            new MovimientoResponse(2L, "Alquiler", "Vivienda", "2026-02-28", 1200.0, MovimientoType.expense),
            new MovimientoResponse(3L, "Supermercado", "Alimentacion", "2026-03-04", 320.0, MovimientoType.expense),
            new MovimientoResponse(4L, "Freelance diseno web", "Freelance", "2026-03-07", 850.0, MovimientoType.income),
            new MovimientoResponse(5L, "Suscripcion Netflix", "Entretenimiento", "2026-03-09", 15.99, MovimientoType.expense),
            new MovimientoResponse(6L, "Electricidad", "Servicios", "2026-03-11", 85.0, MovimientoType.expense),
            new MovimientoResponse(7L, "Gasolina", "Transporte", "2026-03-13", 60.0, MovimientoType.expense),
            new MovimientoResponse(8L, "Dividendos AAPL", "Inversiones", "2026-03-14", 125.0, MovimientoType.income)
    ));

    public List<MovimientoResponse> getAll() {
        return movimientos.stream()
                .sorted(Comparator.comparing(MovimientoResponse::movement_date).reversed())
                .toList();
    }

    public MovimientoResponse create(CreateMovimientoRequest request) {
        MovimientoResponse movimiento = new MovimientoResponse(
                idSequence.incrementAndGet(),
                request.description(),
                request.category_name(),
                request.movement_date(),
                request.amount(),
                request.movement_type()
        );

        movimientos.add(0, movimiento);
        return movimiento;
    }

    public MovimientoResponse update(Long id, CreateMovimientoRequest request) {
        int index = findIndexById(id);
        MovimientoResponse updated = new MovimientoResponse(
                id,
                request.description(),
                request.category_name(),
                request.movement_date(),
                request.amount(),
                request.movement_type()
        );

        movimientos.set(index, updated);
        return updated;
    }

    public void delete(Long id) {
        int index = findIndexById(id);
        movimientos.remove(index);
    }

    private int findIndexById(Long id) {
        for (int i = 0; i < movimientos.size(); i++) {
            if (movimientos.get(i).id().equals(id)) {
                return i;
            }
        }

        throw new ResourceNotFoundException("Movimiento no encontrado con id " + id);
    }
}
