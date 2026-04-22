package com.broker.backend.service;

import com.broker.backend.exception.BusinessException;
import com.broker.backend.exception.ResourceNotFoundException;
import com.broker.backend.model.market.CreateOrderRequest;
import com.broker.backend.model.market.CreateOrderResponse;
import com.broker.backend.persistence.entity.ActivoEntity;
import com.broker.backend.persistence.entity.CuentaBrokerEntity;
import com.broker.backend.persistence.entity.EstadoOrdenEntity;
import com.broker.backend.persistence.entity.OrdenEntity;
import com.broker.backend.persistence.entity.PosicionEntity;
import com.broker.backend.persistence.entity.TipoOperacionEntity;
import com.broker.backend.persistence.entity.TipoOrdenEntity;
import com.broker.backend.persistence.repository.EstadoOrdenRepository;
import com.broker.backend.persistence.repository.OrdenRepository;
import com.broker.backend.persistence.repository.PosicionRepository;
import com.broker.backend.persistence.repository.TipoOperacionRepository;
import com.broker.backend.persistence.repository.TipoOrdenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class TradingService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TradingService.class);
    private static final ZoneId MARKET_ZONE = ZoneId.of("America/New_York");
    private static final LocalTime MARKET_OPEN = LocalTime.of(9, 30);
    private static final LocalTime MARKET_CLOSE = LocalTime.of(16, 0);

    private final DefaultCuentaBrokerService defaultCuentaBrokerService;
    private final MarketService marketService;
    private final OrdenRepository ordenRepository;
    private final PosicionRepository posicionRepository;
    private final EstadoOrdenRepository estadoOrdenRepository;
    private final TipoOperacionRepository tipoOperacionRepository;
    private final TipoOrdenRepository tipoOrdenRepository;

    public TradingService(
            DefaultCuentaBrokerService defaultCuentaBrokerService,
            MarketService marketService,
            OrdenRepository ordenRepository,
            PosicionRepository posicionRepository,
            EstadoOrdenRepository estadoOrdenRepository,
            TipoOperacionRepository tipoOperacionRepository,
            TipoOrdenRepository tipoOrdenRepository
    ) {
        this.defaultCuentaBrokerService = defaultCuentaBrokerService;
        this.marketService = marketService;
        this.ordenRepository = ordenRepository;
        this.posicionRepository = posicionRepository;
        this.estadoOrdenRepository = estadoOrdenRepository;
        this.tipoOperacionRepository = tipoOperacionRepository;
        this.tipoOrdenRepository = tipoOrdenRepository;
    }

    public CreateOrderResponse createOrder(String userEmail, CreateOrderRequest request) {
        CuentaBrokerEntity cuentaBroker = defaultCuentaBrokerService.getOrCreateCuentaBrokerForUser(userEmail);
        ActivoEntity activo = marketService.getOrRefreshAsset(request.simbolo());
        TipoOperacionEntity tipoOperacion = resolveTipoOperacion(request.tipoOperacion());
        TipoOrdenEntity tipoOrden = resolveTipoOrden(request.tipoOrden());

        BigDecimal cantidad = scaleQuantity(request.cantidad());
        BigDecimal precioReferencia = resolveReferencePrice(request, activo);
        BigDecimal valorTotal = calculateTotal(cantidad, precioReferencia);

        LocalDateTime now = LocalDateTime.now();
        boolean marketOpen = isMarketOpen(now);

        if (isBuy(tipoOperacion)) {
            validateBuyBalance(cuentaBroker, valorTotal);
        } else {
            validateSellPosition(cuentaBroker, activo, cantidad);
        }

        OrdenEntity orden = new OrdenEntity();
        orden.setCuentaBroker(cuentaBroker);
        orden.setActivo(activo);
        orden.setTipoOperacion(tipoOperacion);
        orden.setTipoOrden(tipoOrden);
        orden.setCantidad(cantidad);
        orden.setPrecioReferencia(precioReferencia);
        orden.setFechaCreacion(now);

        if (marketOpen) {
            executeOrder(orden, cuentaBroker, activo, cantidad, precioReferencia, valorTotal);
        } else {
            markPendingOrder(orden, cuentaBroker, tipoOperacion, valorTotal);
        }

        OrdenEntity savedOrder = ordenRepository.save(orden);

        return new CreateOrderResponse(
                savedOrder.getId(),
                activo.getSimbolo(),
                tipoOperacion.getNombre(),
                tipoOrden.getNombre(),
                savedOrder.getEstadoOrden().getNombre(),
                cantidad.doubleValue(),
                savedOrder.getPrecioReferencia().doubleValue(),
                savedOrder.getPrecioEjecucion() != null ? savedOrder.getPrecioEjecucion().doubleValue() : null,
                savedOrder.getValorTotal() != null ? savedOrder.getValorTotal().doubleValue() : null,
                cuentaBroker.getSaldoDisponible().doubleValue(),
                cuentaBroker.getSaldoCongelado().doubleValue(),
                buildMessage(savedOrder.getEstadoOrden().getNombre(), tipoOperacion.getNombre(), activo.getSimbolo())
        );
    }

    @Scheduled(fixedDelayString = "${broker.orders.pending-processor-delay-ms:60000}")
    public void processPendingOrdersOnSchedule() {
        try {
            processPendingOrders();
        } catch (Exception exception) {
            LOGGER.error("Fallo procesando ordenes pendientes: {}", exception.getMessage(), exception);
        }
    }

    public void processPendingOrders() {
        if (!isMarketOpen(LocalDateTime.now())) {
            return;
        }

        List<OrdenEntity> pendingOrders = ordenRepository.findAllByEstadoOrdenNombreIgnoreCaseOrderByFechaCreacionAscIdAsc("pendiente");
        for (OrdenEntity pendingOrder : pendingOrders) {
            processSinglePendingOrder(pendingOrder);
        }
    }

    private void executeOrder(
            OrdenEntity orden,
            CuentaBrokerEntity cuentaBroker,
            ActivoEntity activo,
            BigDecimal cantidad,
            BigDecimal executionPrice,
            BigDecimal total
    ) {
        EstadoOrdenEntity estadoEjecutada = resolveEstadoOrden("ejecutada");

        orden.setEstadoOrden(estadoEjecutada);
        orden.setPrecioEjecucion(executionPrice);
        orden.setValorTotal(total);
        orden.setFechaEjecucion(LocalDateTime.now());

        if (isBuy(orden.getTipoOperacion())) {
            cuentaBroker.setSaldoDisponible(cuentaBroker.getSaldoDisponible().subtract(total));
            upsertPositionForBuy(cuentaBroker, activo, cantidad, executionPrice, total);
            return;
        }

        cuentaBroker.setSaldoDisponible(cuentaBroker.getSaldoDisponible().add(total));
        applySellToPosition(cuentaBroker, activo, cantidad);
    }

    private void processSinglePendingOrder(OrdenEntity orden) {
        ActivoEntity activoActualizado = marketService.getOrRefreshAsset(orden.getActivo().getSimbolo());
        BigDecimal executionPrice = activoActualizado.getPrecioActual().setScale(2, RoundingMode.HALF_UP);
        BigDecimal executionTotal = calculateTotal(orden.getCantidad(), executionPrice);

        try {
            if (isBuy(orden.getTipoOperacion())) {
                executePendingBuy(orden, activoActualizado, executionPrice, executionTotal);
            } else {
                executePendingSell(orden, activoActualizado, executionPrice, executionTotal);
            }
        } catch (BusinessException exception) {
            rejectPendingOrder(orden, exception.getMessage(), executionTotal);
        }
    }

    private void executePendingBuy(
            OrdenEntity orden,
            ActivoEntity activo,
            BigDecimal executionPrice,
            BigDecimal executionTotal
    ) {
        CuentaBrokerEntity cuentaBroker = orden.getCuentaBroker();
        BigDecimal reservedTotal = orden.getValorTotal() != null ? orden.getValorTotal() : calculateTotal(orden.getCantidad(), orden.getPrecioReferencia());
        BigDecimal difference = executionTotal.subtract(reservedTotal);

        if (difference.compareTo(BigDecimal.ZERO) > 0 && cuentaBroker.getSaldoDisponible().compareTo(difference) < 0) {
            throw new BusinessException("La orden pendiente ya no tiene saldo suficiente para ejecutarse");
        }

        cuentaBroker.setSaldoCongelado(maxZero(cuentaBroker.getSaldoCongelado().subtract(reservedTotal)));

        if (difference.compareTo(BigDecimal.ZERO) > 0) {
            cuentaBroker.setSaldoDisponible(cuentaBroker.getSaldoDisponible().subtract(difference));
        } else if (difference.compareTo(BigDecimal.ZERO) < 0) {
            cuentaBroker.setSaldoDisponible(cuentaBroker.getSaldoDisponible().add(difference.abs()));
        }

        finalizeOrderAsExecuted(orden, activo, executionPrice, executionTotal);
        upsertPositionForBuy(cuentaBroker, activo, orden.getCantidad(), executionPrice, executionTotal);
    }

    private void executePendingSell(
            OrdenEntity orden,
            ActivoEntity activo,
            BigDecimal executionPrice,
            BigDecimal executionTotal
    ) {
        validateSellPosition(orden.getCuentaBroker(), activo, orden.getCantidad());
        finalizeOrderAsExecuted(orden, activo, executionPrice, executionTotal);
        orden.getCuentaBroker().setSaldoDisponible(orden.getCuentaBroker().getSaldoDisponible().add(executionTotal));
        applySellToPosition(orden.getCuentaBroker(), activo, orden.getCantidad());
    }

    private void finalizeOrderAsExecuted(
            OrdenEntity orden,
            ActivoEntity activo,
            BigDecimal executionPrice,
            BigDecimal executionTotal
    ) {
        orden.setActivo(activo);
        orden.setEstadoOrden(resolveEstadoOrden("ejecutada"));
        orden.setPrecioEjecucion(executionPrice);
        orden.setValorTotal(executionTotal);
        orden.setFechaEjecucion(LocalDateTime.now());
        ordenRepository.save(orden);
    }

    private void rejectPendingOrder(OrdenEntity orden, String reason, BigDecimal currentTotal) {
        if (isBuy(orden.getTipoOperacion())) {
            BigDecimal reservedTotal = orden.getValorTotal() != null ? orden.getValorTotal() : currentTotal;
            orden.getCuentaBroker().setSaldoCongelado(maxZero(orden.getCuentaBroker().getSaldoCongelado().subtract(reservedTotal)));
            orden.getCuentaBroker().setSaldoDisponible(orden.getCuentaBroker().getSaldoDisponible().add(reservedTotal));
        }

        orden.setEstadoOrden(resolveEstadoOrden("rechazada"));
        orden.setFechaEjecucion(LocalDateTime.now());
        ordenRepository.save(orden);
        LOGGER.info("Orden pendiente {} rechazada: {}", orden.getId(), reason);
    }

    private void markPendingOrder(
            OrdenEntity orden,
            CuentaBrokerEntity cuentaBroker,
            TipoOperacionEntity tipoOperacion,
            BigDecimal total
    ) {
        EstadoOrdenEntity estadoPendiente = resolveEstadoOrden("pendiente");

        orden.setEstadoOrden(estadoPendiente);
        orden.setPrecioEjecucion(null);
        orden.setValorTotal(total);
        orden.setFechaEjecucion(null);

        if (isBuy(tipoOperacion)) {
            cuentaBroker.setSaldoDisponible(cuentaBroker.getSaldoDisponible().subtract(total));
            cuentaBroker.setSaldoCongelado(cuentaBroker.getSaldoCongelado().add(total));
        }
    }

    private void upsertPositionForBuy(
            CuentaBrokerEntity cuentaBroker,
            ActivoEntity activo,
            BigDecimal cantidadComprada,
            BigDecimal precioEjecucion,
            BigDecimal totalCompra
    ) {
        PosicionEntity posicion = posicionRepository.findByCuentaBrokerIdAndActivoId(cuentaBroker.getId(), activo.getId())
                .orElseGet(PosicionEntity::new);

        if (posicion.getId() == null) {
            posicion.setCuentaBroker(cuentaBroker);
            posicion.setActivo(activo);
            posicion.setCantidad(cantidadComprada);
            posicion.setPrecioPromedio(precioEjecucion);
            posicionRepository.save(posicion);
            return;
        }

        BigDecimal cantidadActual = posicion.getCantidad();
        BigDecimal totalActual = cantidadActual.multiply(posicion.getPrecioPromedio());
        BigDecimal nuevaCantidad = cantidadActual.add(cantidadComprada);
        BigDecimal nuevoPromedio = totalActual.add(totalCompra)
                .divide(nuevaCantidad, 2, RoundingMode.HALF_UP);

        posicion.setCantidad(nuevaCantidad);
        posicion.setPrecioPromedio(nuevoPromedio);
        posicionRepository.save(posicion);
    }

    private void applySellToPosition(CuentaBrokerEntity cuentaBroker, ActivoEntity activo, BigDecimal cantidadVenta) {
        PosicionEntity posicion = posicionRepository.findByCuentaBrokerIdAndActivoId(cuentaBroker.getId(), activo.getId())
                .orElseThrow(() -> new BusinessException("No existe una posicion abierta para " + activo.getSimbolo()));

        BigDecimal remaining = posicion.getCantidad().subtract(cantidadVenta);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("No puedes vender mas unidades de las disponibles");
        }

        if (remaining.compareTo(BigDecimal.ZERO) == 0) {
            posicionRepository.delete(posicion);
            return;
        }

        posicion.setCantidad(remaining);
        posicionRepository.save(posicion);
    }

    private void validateBuyBalance(CuentaBrokerEntity cuentaBroker, BigDecimal total) {
        if (cuentaBroker.getSaldoDisponible().compareTo(total) < 0) {
            throw new BusinessException("Saldo insuficiente para ejecutar la compra");
        }
    }

    private void validateSellPosition(CuentaBrokerEntity cuentaBroker, ActivoEntity activo, BigDecimal cantidad) {
        PosicionEntity posicion = posicionRepository.findByCuentaBrokerIdAndActivoId(cuentaBroker.getId(), activo.getId())
                .orElseThrow(() -> new BusinessException("Solo puedes vender activos con posicion abierta"));

        if (posicion.getCantidad().compareTo(cantidad) < 0) {
            throw new BusinessException("La cantidad a vender supera la posicion disponible");
        }
    }

    private TipoOperacionEntity resolveTipoOperacion(String value) {
        String normalized = normalizeRequired(value, "tipo de operacion");
        return tipoOperacionRepository.findByNombreIgnoreCase(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el tipo de operacion " + normalized));
    }

    private TipoOrdenEntity resolveTipoOrden(String value) {
        String normalized = value == null || value.isBlank() ? "mercado" : value.trim().toLowerCase(Locale.ROOT);
        return tipoOrdenRepository.findByNombreIgnoreCase(normalized)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el tipo de orden " + normalized));
    }

    private EstadoOrdenEntity resolveEstadoOrden(String value) {
        return estadoOrdenRepository.findByNombreIgnoreCase(value)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el estado de orden " + value));
    }

    private BigDecimal resolveReferencePrice(CreateOrderRequest request, ActivoEntity activo) {
        String tipoOrden = request.tipoOrden() == null || request.tipoOrden().isBlank()
                ? "mercado"
                : request.tipoOrden().trim().toLowerCase(Locale.ROOT);

        if ("limite".equals(tipoOrden)) {
            if (request.precioLimite() == null || request.precioLimite().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Las ordenes limite requieren un precio limite mayor a cero");
            }

            return request.precioLimite().setScale(2, RoundingMode.HALF_UP);
        }

        return activo.getPrecioActual().setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateTotal(BigDecimal cantidad, BigDecimal precio) {
        return cantidad.multiply(precio).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal scaleQuantity(BigDecimal cantidad) {
        return cantidad.setScale(4, RoundingMode.HALF_UP);
    }

    private boolean isBuy(TipoOperacionEntity tipoOperacion) {
        return "compra".equalsIgnoreCase(tipoOperacion.getNombre());
    }

    private boolean isMarketOpen(LocalDateTime timestamp) {
        ZonedDateTime marketTime = timestamp.atZone(ZoneId.systemDefault()).withZoneSameInstant(MARKET_ZONE);
        DayOfWeek day = marketTime.getDayOfWeek();

        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            return false;
        }

        LocalTime currentTime = marketTime.toLocalTime();
        return !currentTime.isBefore(MARKET_OPEN) && !currentTime.isAfter(MARKET_CLOSE);
    }

    private BigDecimal maxZero(BigDecimal value) {
        return value.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : value;
    }

    private String normalizeRequired(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BusinessException("El " + fieldName + " es obligatorio");
        }

        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String buildMessage(String status, String operationType, String symbol) {
        if ("ejecutada".equalsIgnoreCase(status)) {
            return "La orden de " + operationType + " para " + symbol + " fue ejecutada";
        }

        return "La orden de " + operationType + " para " + symbol + " quedo pendiente por mercado cerrado";
    }
}
