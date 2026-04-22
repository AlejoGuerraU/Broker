package com.broker.backend.service;

import com.broker.backend.model.portafolio.PortfolioMapper;
import com.broker.backend.model.portafolio.PortfolioAccountSummaryResponse;
import com.broker.backend.model.portafolio.PortfolioOrderResponse;
import com.broker.backend.model.portafolio.PortfolioPositionResponse;
import com.broker.backend.persistence.entity.CuentaBrokerEntity;
import com.broker.backend.persistence.repository.HistorialPrecioRepository;
import com.broker.backend.persistence.repository.OrdenRepository;
import com.broker.backend.persistence.repository.PosicionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class PortfolioService {

    private final PosicionRepository posicionRepository;
    private final OrdenRepository ordenRepository;
    private final HistorialPrecioRepository historialPrecioRepository;
    private final DefaultCuentaBrokerService defaultCuentaBrokerService;
    private final MarketService marketService;
    private final PortfolioMapper portfolioMapper;

    public PortfolioService(
            PosicionRepository posicionRepository,
            OrdenRepository ordenRepository,
            HistorialPrecioRepository historialPrecioRepository,
            DefaultCuentaBrokerService defaultCuentaBrokerService,
            MarketService marketService,
            PortfolioMapper portfolioMapper
    ) {
        this.posicionRepository = posicionRepository;
        this.ordenRepository = ordenRepository;
        this.historialPrecioRepository = historialPrecioRepository;
        this.defaultCuentaBrokerService = defaultCuentaBrokerService;
        this.marketService = marketService;
        this.portfolioMapper = portfolioMapper;
    }

    public List<PortfolioPositionResponse> getPositions(String userEmail) {
        CuentaBrokerEntity cuentaBroker = defaultCuentaBrokerService.getOrCreateCuentaBrokerForUser(userEmail);
        List<String> trackedSymbols = posicionRepository.findAllByCuentaBrokerIdOrderByActivoSimboloAsc(cuentaBroker.getId()).stream()
                .map(posicion -> posicion.getActivo().getSimbolo())
                .toList();

        marketService.refreshAssetQuotes(trackedSymbols);

        return posicionRepository.findAllByCuentaBrokerIdOrderByActivoSimboloAsc(cuentaBroker.getId()).stream()
                .map(posicion -> portfolioMapper.toPositionResponse(
                        posicion,
                        historialPrecioRepository.findTop2ByActivoIdOrderByFechaDesc(posicion.getActivo().getId())
                ))
                .toList();
    }

    public List<PortfolioOrderResponse> getOrders(String userEmail) {
        CuentaBrokerEntity cuentaBroker = defaultCuentaBrokerService.getOrCreateCuentaBrokerForUser(userEmail);

        return ordenRepository.findAllByCuentaBrokerIdOrderByFechaCreacionDescIdDesc(cuentaBroker.getId()).stream()
                .map(portfolioMapper::toOrderResponse)
                .toList();
    }

    public PortfolioAccountSummaryResponse getAccountSummary(String userEmail) {
        CuentaBrokerEntity cuentaBroker = defaultCuentaBrokerService.getOrCreateCuentaBrokerForUser(userEmail);

        return new PortfolioAccountSummaryResponse(
                cuentaBroker.getSaldoDisponible().doubleValue(),
                cuentaBroker.getSaldoCongelado().doubleValue()
        );
    }
}
