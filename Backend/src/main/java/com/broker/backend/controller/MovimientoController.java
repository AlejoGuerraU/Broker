package com.broker.backend.controller;

import com.broker.backend.model.movimiento.CreateMovimientoRequest;
import com.broker.backend.model.movimiento.MovimientoResponse;
import com.broker.backend.service.MovimientoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    private final MovimientoService movimientoService;

    public MovimientoController(MovimientoService movimientoService) {
        this.movimientoService = movimientoService;
    }

    @GetMapping
    public List<MovimientoResponse> getMovimientos() {
        return movimientoService.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovimientoResponse createMovimiento(@Valid @RequestBody CreateMovimientoRequest request) {
        return movimientoService.create(request);
    }

    @PutMapping("/{id}")
    public MovimientoResponse updateMovimiento(
            @PathVariable Long id,
            @Valid @RequestBody CreateMovimientoRequest request
    ) {
        return movimientoService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMovimiento(@PathVariable Long id) {
        movimientoService.delete(id);
    }
}
