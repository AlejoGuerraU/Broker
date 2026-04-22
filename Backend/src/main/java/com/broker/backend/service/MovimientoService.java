package com.broker.backend.service;

import com.broker.backend.exception.ResourceNotFoundException;
import com.broker.backend.model.movimiento.CreateMovimientoRequest;
import com.broker.backend.model.movimiento.MovimientoMapper;
import com.broker.backend.model.movimiento.MovimientoResponse;
import com.broker.backend.persistence.entity.CategoriaEntity;
import com.broker.backend.persistence.entity.CuentaGestorEntity;
import com.broker.backend.persistence.entity.MovimientoEntity;
import com.broker.backend.persistence.repository.CuentaGestorRepository;
import com.broker.backend.persistence.repository.MovimientoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final CuentaGestorRepository cuentaGestorRepository;
    private final DefaultCuentaGestorService defaultCuentaGestorService;
    private final MovimientoCategoriaService movimientoCategoriaService;
    private final MovimientoMapper movimientoMapper;

    public MovimientoService(
            MovimientoRepository movimientoRepository,
            CuentaGestorRepository cuentaGestorRepository,
            DefaultCuentaGestorService defaultCuentaGestorService,
            MovimientoCategoriaService movimientoCategoriaService,
            MovimientoMapper movimientoMapper
    ) {
        this.movimientoRepository = movimientoRepository;
        this.cuentaGestorRepository = cuentaGestorRepository;
        this.defaultCuentaGestorService = defaultCuentaGestorService;
        this.movimientoCategoriaService = movimientoCategoriaService;
        this.movimientoMapper = movimientoMapper;
    }

    public List<MovimientoResponse> getAll(String userEmail) {
        CuentaGestorEntity cuentaGestor = defaultCuentaGestorService.getOrCreateCuentaGestorForUser(userEmail);

        return movimientoRepository.findAllByCuentaGestorIdOrderByFechaDescIdDesc(cuentaGestor.getId()).stream()
                .map(movimientoMapper::toResponse)
                .toList();
    }

    public MovimientoResponse create(String userEmail, CreateMovimientoRequest request) {
        CuentaGestorEntity cuentaGestor = defaultCuentaGestorService.getOrCreateCuentaGestorForUser(userEmail);
        CategoriaEntity categoria = movimientoCategoriaService.resolveCategoria(request);

        MovimientoEntity movimiento = new MovimientoEntity();
        movimiento.setCuentaGestor(cuentaGestor);
        movimiento.setCategoria(categoria);
        movimiento.setDescripcion(request.description().trim());
        movimiento.setCantidad(BigDecimal.valueOf(request.amount()));
        movimiento.setFecha(parseMovementDate(request.movement_date()));

        MovimientoEntity saved = movimientoRepository.save(movimiento);
        recalculateSaldo(cuentaGestor);
        return movimientoMapper.toResponse(saved);
    }

    public MovimientoResponse update(String userEmail, Long id, CreateMovimientoRequest request) {
        CuentaGestorEntity cuentaGestor = defaultCuentaGestorService.getOrCreateCuentaGestorForUser(userEmail);
        MovimientoEntity movimiento = movimientoRepository.findByIdAndCuentaGestorId(id, cuentaGestor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento no encontrado con id " + id));

        movimiento.setCategoria(movimientoCategoriaService.resolveCategoria(request));
        movimiento.setDescripcion(request.description().trim());
        movimiento.setCantidad(BigDecimal.valueOf(request.amount()));
        movimiento.setFecha(parseMovementDate(request.movement_date()));

        MovimientoEntity updated = movimientoRepository.save(movimiento);
        recalculateSaldo(cuentaGestor);
        return movimientoMapper.toResponse(updated);
    }

    public void delete(String userEmail, Long id) {
        CuentaGestorEntity cuentaGestor = defaultCuentaGestorService.getOrCreateCuentaGestorForUser(userEmail);
        MovimientoEntity movimiento = movimientoRepository.findByIdAndCuentaGestorId(id, cuentaGestor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento no encontrado con id " + id));

        movimientoRepository.delete(movimiento);
        recalculateSaldo(cuentaGestor);
    }

    private LocalDateTime parseMovementDate(String movementDate) {
        return LocalDate.parse(movementDate).atStartOfDay();
    }

    private void recalculateSaldo(CuentaGestorEntity cuentaGestor) {
        BigDecimal saldo = movimientoRepository.findAllByCuentaGestorIdOrderByFechaDescIdDesc(cuentaGestor.getId()).stream()
                .map(movimiento -> {
                    BigDecimal amount = movimiento.getCantidad();
                    String tipo = movimiento.getCategoria().getTipoMovimiento().getNombre();
                    return "ingreso".equalsIgnoreCase(tipo) ? amount : amount.negate();
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        cuentaGestor.setSaldo(saldo);
        cuentaGestorRepository.save(cuentaGestor);
    }
}
