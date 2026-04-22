package com.broker.backend.service;

import com.broker.backend.exception.ResourceNotFoundException;
import com.broker.backend.model.movimiento.CreateMovimientoRequest;
import com.broker.backend.model.movimiento.MovimientoType;
import com.broker.backend.persistence.entity.CategoriaEntity;
import com.broker.backend.persistence.entity.TipoMovimientoEntity;
import com.broker.backend.persistence.repository.CategoriaRepository;
import com.broker.backend.persistence.repository.TipoMovimientoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MovimientoCategoriaService {

    private final TipoMovimientoRepository tipoMovimientoRepository;
    private final CategoriaRepository categoriaRepository;

    public MovimientoCategoriaService(
            TipoMovimientoRepository tipoMovimientoRepository,
            CategoriaRepository categoriaRepository
    ) {
        this.tipoMovimientoRepository = tipoMovimientoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public CategoriaEntity resolveCategoria(CreateMovimientoRequest request) {
        TipoMovimientoEntity tipoMovimiento = tipoMovimientoRepository
                .findByNombreIgnoreCase(mapTipoMovimientoNombre(request.movement_type()))
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de movimiento no configurado"));

        String categoryName = request.category_name().trim();

        return categoriaRepository
                .findByTipoMovimientoIdAndNombreIgnoreCase(tipoMovimiento.getId(), categoryName)
                .orElseGet(() -> createCategoria(tipoMovimiento, categoryName));
    }

    private CategoriaEntity createCategoria(TipoMovimientoEntity tipoMovimiento, String categoryName) {
        CategoriaEntity categoria = new CategoriaEntity();
        categoria.setTipoMovimiento(tipoMovimiento);
        categoria.setNombre(categoryName);
        return categoriaRepository.save(categoria);
    }

    private String mapTipoMovimientoNombre(MovimientoType movementType) {
        return movementType == MovimientoType.income ? "ingreso" : "egreso";
    }
}
