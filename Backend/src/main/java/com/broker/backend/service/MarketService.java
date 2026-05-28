package com.broker.backend.service;

import com.broker.backend.exception.ResourceNotFoundException;
import com.broker.backend.model.market.MarketAssetDetailResponse;
import com.broker.backend.model.market.MarketAssetPriceHistoryResponse;
import com.broker.backend.model.market.MarketAssetPricePointResponse;
import com.broker.backend.model.market.MarketDataStatusResponse;
import com.broker.backend.model.market.MarketStockResponse;
import com.broker.backend.persistence.entity.ActivoEntity;
import com.broker.backend.persistence.entity.EstadoActivoEntity;
import com.broker.backend.persistence.entity.HistorialPrecioEntity;
import com.broker.backend.persistence.entity.TipoActivoEntity;
import com.broker.backend.persistence.repository.ActivoRepository;
import com.broker.backend.persistence.repository.EstadoActivoRepository;
import com.broker.backend.persistence.repository.HistorialPrecioRepository;
import com.broker.backend.persistence.repository.TipoActivoRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional(readOnly = true)
public class MarketService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MarketService.class);
    private static final ZoneId MARKET_ZONE = ZoneId.of("America/New_York");
    private static final LocalTime MARKET_OPEN = LocalTime.of(9, 30);
    private static final LocalTime MARKET_CLOSE = LocalTime.of(16, 0);
    private static final long CACHE_TTL_MINUTES = 15;

    // ── In-memory cache ──────────────────────────────────────────────────────
    private volatile List<AlphaVantageMostActiveItem> cachedMostActive = null;
    private volatile LocalDateTime cachedMostActiveAt = null;
    private volatile LocalDateTime lastRemoteSyncAt = null;
    private final Map<String, GlobalQuoteItem> cachedGlobalQuotes = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> cachedGlobalQuotesAt = new ConcurrentHashMap<>();

    private static final List<String> LOGO_CLASSES = List.of(
            "bg-[#E8EEF9] text-[#1C2430]",
            "bg-[#DFF7D8] text-[#1F5F27]",
            "bg-[#FFE3E2] text-[#8A1F1D]",
            "bg-[#FFF1D6] text-[#8A5B07]",
            "bg-[#DDEBFF] text-[#12438B]",
            "bg-[#E7E0FF] text-[#4D2CA3]"
    );

    private static final List<String> FEATURED_SYMBOLS = List.of(
            "AAPL",
            "MSFT",
            "KO",
            "JPM",
            "NVDA",
            "TSLA",
            "AMZN",
            "META"
    );

    private static final List<DefaultMarketAsset> DEFAULT_MARKET_ASSETS = List.of(
            new DefaultMarketAsset("Apple Inc.", "AAPL", "Tecnologia", "USD", "214.32", "210.45", "189200000"),
            new DefaultMarketAsset("NVIDIA Corp.", "NVDA", "Tecnologia", "USD", "942.67", "914.16", "244800000"),
            new DefaultMarketAsset("Tesla Inc.", "TSLA", "Consumo discrecional", "USD", "176.45", "180.81", "132400000"),
            new DefaultMarketAsset("Amazon.com Inc.", "AMZN", "Consumo discrecional", "USD", "182.90", "181.16", "71900000"),
            new DefaultMarketAsset("Microsoft Corp.", "MSFT", "Tecnologia", "USD", "428.11", "422.75", "39500000"),
            new DefaultMarketAsset("Meta Platforms Inc.", "META", "Tecnologia", "USD", "503.74", "507.19", "26100000")
    );

    private final RestClient alphaVantageClient;
    private final RestClient finnhubClient;
    private final ActivoRepository activoRepository;
    private final HistorialPrecioRepository historialPrecioRepository;
    private final TipoActivoRepository tipoActivoRepository;
    private final EstadoActivoRepository estadoActivoRepository;
    private final String alphaVantageApiKey;
    private final String finnhubApiKey;

    public MarketService(
            RestClient.Builder restClientBuilder,
            ActivoRepository activoRepository,
            HistorialPrecioRepository historialPrecioRepository,
            TipoActivoRepository tipoActivoRepository,
            EstadoActivoRepository estadoActivoRepository,
            @Value("${alpha.vantage.api-key:${ALPHA_VANTAGE_API_KEY:}}") String alphaVantageApiKey,
            @Value("${finnhub.api-key:${FINNHUB_API_KEY:}}") String finnhubApiKey
    ) {
        this.alphaVantageClient = restClientBuilder
                .baseUrl("https://www.alphavantage.co")
                .build();
        this.finnhubClient = restClientBuilder
                .baseUrl("https://finnhub.io")
                .build();
        this.activoRepository = activoRepository;
        this.historialPrecioRepository = historialPrecioRepository;
        this.tipoActivoRepository = tipoActivoRepository;
        this.estadoActivoRepository = estadoActivoRepository;
        this.alphaVantageApiKey = alphaVantageApiKey;
        this.finnhubApiKey = finnhubApiKey;
    }

    @PostConstruct
    void logMarketProviderConfiguration() {
        boolean alphaConfigured = isApiKeyConfigured(alphaVantageApiKey);
        boolean finnhubConfigured = isApiKeyConfigured(finnhubApiKey);

        if (!alphaConfigured && !finnhubConfigured) {
            LOGGER.warn(
                    "Sin ALPHA_VANTAGE_API_KEY ni FINNHUB_API_KEY. "
                            + "Definelas en el entorno, en Backend/.env o en application-local.properties."
            );
            return;
        }

        if (alphaConfigured) {
            LOGGER.info("Proveedor de mercado: Alpha Vantage configurado.");
        }
        if (finnhubConfigured) {
            LOGGER.info("Proveedor de mercado: Finnhub configurado{}.",
                    alphaConfigured ? " (respaldo de cotizaciones)" : "");
        }
    }



    @Transactional
    public List<MarketStockResponse> getMostActiveStocks() {
        ensureLocalMarketData();

        List<AlphaVantageMostActiveItem> remoteItems = fetchMostActiveItems();
        if (!remoteItems.isEmpty()) {
            persistAndMapRemoteItems(remoteItems);
        }

        if (hasAnyMarketApiKey()) {
            refreshFeaturedSymbols();
        }

        return activoRepository.findAllByOrderBySimboloAsc().stream()
                .map(this::mapStoredAsset)
                .toList();
    }

    @Transactional
    public MarketAssetDetailResponse getAssetDetail(String simbolo) {
        // Solo garantizar que existan datos locales; el sync completo
        // (fetchMostActiveItems + refreshFeaturedSymbols) ya lo hace getMostActiveStocks.
        // Llamar a syncAssetUniverse aqui dispararía 8+ llamadas GLOBAL_QUOTE extra.
        ensureLocalMarketData();

        ActivoEntity activo = activoRepository.findBySimboloIgnoreCase(simbolo)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un activo con simbolo " + simbolo));

        List<HistorialPrecioEntity> latestPrices = historialPrecioRepository
                .findTop2ByActivoIdOrderByFechaDesc(activo.getId());

        return new MarketAssetDetailResponse(
                activo.getId(),
                activo.getNombre(),
                activo.getSimbolo(),
                activo.getPrecioActual().doubleValue(),
                calculateDailyChangePercent(latestPrices),
                "N/A",
                activo.getMercado(),
                activo.getMoneda()
        );
    }

    @Transactional
    public MarketAssetPriceHistoryResponse getAssetPriceHistory(String simbolo) {
        ensureLocalMarketData();

        ActivoEntity activo = activoRepository.findBySimboloIgnoreCase(simbolo)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un activo con simbolo " + simbolo));

        List<MarketAssetPricePointResponse> puntos = historialPrecioRepository
                .findTop30ByActivoIdOrderByFechaDesc(activo.getId()).stream()
                .sorted((left, right) -> left.getFecha().compareTo(right.getFecha()))
                .map(historial -> new MarketAssetPricePointResponse(
                        historial.getFecha(),
                        historial.getPrecioApertura().doubleValue(),
                        historial.getPrecioMaximo().doubleValue(),
                        historial.getPrecioMinimo().doubleValue(),
                        historial.getPrecioCierre().doubleValue()
                ))
                .toList();

        return new MarketAssetPriceHistoryResponse(
                activo.getId(),
                activo.getSimbolo(),
                activo.getMoneda(),
                puntos
        );
    }

    @Transactional
    public ActivoEntity getOrRefreshAsset(String simbolo) {
        refreshAssetQuote(simbolo);
        syncAssetUniverse();

        return activoRepository.findBySimboloIgnoreCase(simbolo)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un activo con simbolo " + simbolo));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void refreshAssetQuotes(Collection<String> simbolos) {
        simbolos.stream()
                .filter(simbolo -> simbolo != null && !simbolo.isBlank())
                .map(simbolo -> simbolo.trim().toUpperCase(Locale.ROOT))
                .distinct()
                .forEach(this::refreshAssetQuoteInternal);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void refreshAssetQuote(String simbolo) {
        if (simbolo == null || simbolo.isBlank()) {
            return;
        }

        refreshAssetQuoteInternal(simbolo.trim().toUpperCase(Locale.ROOT));
    }

    public MarketDataStatusResponse getMarketDataStatus() {
        boolean alphaKeyConfigured = isApiKeyConfigured(alphaVantageApiKey);
        boolean finnhubKeyConfigured = isApiKeyConfigured(finnhubApiKey);
        boolean marketOpen = isMarketOpen(LocalDateTime.now());
        int persistedAssets = activoRepository.findAllByOrderBySimboloAsc().size();

        boolean alphaCacheFresh = cachedMostActive != null
                && !cachedMostActive.isEmpty()
                && isCacheFresh(cachedMostActiveAt);
        boolean quoteCacheFresh = cachedGlobalQuotesAt.values().stream().anyMatch(this::isCacheFresh);
        boolean recentRemoteSync = isCacheFresh(lastRemoteSyncAt);

        if (alphaCacheFresh || recentRemoteSync) {
            String fuente = resolveLiveDataSource(alphaKeyConfigured, finnhubKeyConfigured, quoteCacheFresh);
            return new MarketDataStatusResponse(
                    fuente,
                    alphaKeyConfigured,
                    true,
                    marketOpen,
                    MARKET_ZONE.getId(),
                    persistedAssets,
                    buildLiveDataMessage(fuente)
            );
        }

        if (alphaKeyConfigured || finnhubKeyConfigured) {
            String fuente = alphaKeyConfigured ? "alpha_vantage" : "finnhub";
            return new MarketDataStatusResponse(
                    fuente,
                    alphaKeyConfigured,
                    false,
                    marketOpen,
                    MARKET_ZONE.getId(),
                    persistedAssets,
                    persistedAssets > 0
                            ? "API configurada. Mostrando datos persistidos; abre Invertir para sincronizar cotizaciones en vivo."
                            : "API configurada. La primera carga de Invertir sincronizara el mercado."
            );
        }

        return new MarketDataStatusResponse(
                "respaldo_local",
                false,
                false,
                marketOpen,
                MARKET_ZONE.getId(),
                persistedAssets,
                persistedAssets > 0
                        ? "Sin API keys. Usando el ultimo estado persistido en la base de datos."
                        : "Sin API keys ni mercado persistido. Configura ALPHA_VANTAGE_API_KEY o FINNHUB_API_KEY y recarga."
        );
    }

    private void syncAssetUniverse() {
        List<AlphaVantageMostActiveItem> remoteItems = fetchMostActiveItems();
        if (!remoteItems.isEmpty()) {
            persistAndMapRemoteItems(remoteItems);
        }

        ensureLocalMarketData();
        if (hasAnyMarketApiKey()) {
            refreshFeaturedSymbols();
        }
    }

    private void refreshFeaturedSymbols() {
        FEATURED_SYMBOLS.forEach(this::refreshAssetQuoteInternal);
    }

    private void refreshAssetQuoteInternal(String simbolo) {
        Optional<GlobalQuoteItem> quoteOptional = fetchGlobalQuote(simbolo);
        if (quoteOptional.isEmpty()) {
            return;
        }

        TipoActivoEntity tipoAccion = tipoActivoRepository.findByNombreIgnoreCase("accion")
                .orElseThrow(() -> new ResourceNotFoundException("No existe el tipo de activo accion"));
        EstadoActivoEntity estadoActivo = estadoActivoRepository.findByNombreIgnoreCase("activo")
                .orElseThrow(() -> new ResourceNotFoundException("No existe el estado de activo activo"));

        GlobalQuoteItem quote = quoteOptional.get();
        BigDecimal currentPrice = parseDecimal(quote.price());
        BigDecimal previousClose = parseDecimal(quote.previousClose());

        ActivoEntity activo = activoRepository.findBySimboloIgnoreCase(simbolo)
                .orElseGet(ActivoEntity::new);

        if (activo.getNombre() == null || activo.getNombre().isBlank()) {
            activo.setNombre(buildName(simbolo));
        }

        activo.setSimbolo(simbolo);
        activo.setTipoActivo(tipoAccion);
        activo.setEstadoActivo(estadoActivo);
        activo.setPrecioActual(currentPrice);
        if (activo.getMercado() == null || activo.getMercado().isBlank()) {
            activo.setMercado("USA");
        }
        if (activo.getMoneda() == null || activo.getMoneda().isBlank()) {
            activo.setMoneda("USD");
        }
        ActivoEntity savedAsset = activoRepository.save(activo);

        LocalDateTime snapshotTime = LocalDateTime.now().withSecond(0).withNano(0);
        HistorialPrecioEntity snapshot = historialPrecioRepository
                .findByActivoIdAndFecha(savedAsset.getId(), snapshotTime)
                .orElseGet(HistorialPrecioEntity::new);

        snapshot.setActivo(savedAsset);
        snapshot.setFecha(snapshotTime);
        snapshot.setPrecioApertura(previousClose.compareTo(BigDecimal.ZERO) > 0 ? previousClose : currentPrice);
        snapshot.setPrecioMaximo(currentPrice);
        snapshot.setPrecioMinimo(previousClose.compareTo(BigDecimal.ZERO) > 0 ? previousClose.min(currentPrice) : currentPrice);
        snapshot.setPrecioCierre(currentPrice);
        historialPrecioRepository.save(snapshot);
    }

    private List<AlphaVantageMostActiveItem> fetchMostActiveItems() {
        if (alphaVantageApiKey == null || alphaVantageApiKey.isBlank()) {
            return List.of();
        }

        // Serve from cache if still fresh
        if (cachedMostActive != null && isCacheFresh(cachedMostActiveAt)) {
            LOGGER.debug("Cache hit para TOP_GAINERS_LOSERS (expira en {} min)",
                    CACHE_TTL_MINUTES - java.time.Duration.between(cachedMostActiveAt, LocalDateTime.now()).toMinutes());
            return cachedMostActive;
        }

        try {
            AlphaVantageResponse response = alphaVantageClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/query")
                            .queryParam("function", "TOP_GAINERS_LOSERS")
                            .queryParam("apikey", alphaVantageApiKey)
                            .build())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(AlphaVantageResponse.class);

            if (response == null || response.hasError()) {
                LOGGER.warn("No se pudo sincronizar mercado desde Alpha Vantage: {}", response != null ? response.errorMessage() : "respuesta vacia");
                return List.of();
            }

            cachedMostActive = response.items();
            cachedMostActiveAt = LocalDateTime.now();
            markRemoteSyncSuccess();
            LOGGER.info("Cache actualizado para TOP_GAINERS_LOSERS con {} items", cachedMostActive.size());
            return cachedMostActive;
        } catch (Exception exception) {
            LOGGER.warn("Fallo al consultar Alpha Vantage para mercado: {}", exception.getMessage());
            return List.of();
        }
    }

    private Optional<GlobalQuoteItem> fetchGlobalQuote(String simbolo) {
        if (alphaVantageApiKey == null || alphaVantageApiKey.isBlank()) {
            // Try Finnhub if Alpha Vantage not configured
            return fetchFinnhubQuote(simbolo);
        }

        // Serve from cache if still fresh
        LocalDateTime cachedAt = cachedGlobalQuotesAt.get(simbolo);
        if (isCacheFresh(cachedAt)) {
            LOGGER.debug("Cache hit para GLOBAL_QUOTE de {}", simbolo);
            return Optional.of(cachedGlobalQuotes.get(simbolo));
        }

        try {
            GlobalQuoteResponse response = alphaVantageClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/query")
                            .queryParam("function", "GLOBAL_QUOTE")
                            .queryParam("symbol", simbolo)
                            .queryParam("apikey", alphaVantageApiKey)
                            .build())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(GlobalQuoteResponse.class);

            if (response == null || response.hasError() || response.quote() == null || response.quote().isEmpty()) {
                // Fallback to Finnhub
                return fetchFinnhubQuote(simbolo);
            }

            cachedGlobalQuotes.put(simbolo, response.quote());
            cachedGlobalQuotesAt.put(simbolo, LocalDateTime.now());
            markRemoteSyncSuccess();
            LOGGER.info("Cache actualizado para GLOBAL_QUOTE de {}", simbolo);
            return Optional.of(response.quote());
        } catch (Exception exception) {
            LOGGER.warn("Fallo al consultar Alpha Vantage para {}: {}", simbolo, exception.getMessage());
            // Fallback to Finnhub
            return fetchFinnhubQuote(simbolo);
        }
    }

    private Optional<GlobalQuoteItem> fetchFinnhubQuote(String simbolo) {
        if (finnhubApiKey == null || finnhubApiKey.isBlank()) {
            return Optional.empty();
        }
        // No separate cache, reuse same maps
        LocalDateTime cachedAt = cachedGlobalQuotesAt.get(simbolo);
        if (isCacheFresh(cachedAt)) {
            LOGGER.debug("Cache hit para FINNHUB_QUOTE de {}", simbolo);
            return Optional.of(cachedGlobalQuotes.get(simbolo));
        }
        try {
            FinnhubQuoteResponse finnhubResponse = finnhubClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/quote")
                            .queryParam("symbol", simbolo)
                            .queryParam("token", finnhubApiKey)
                            .build())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(FinnhubQuoteResponse.class);
            if (finnhubResponse == null || finnhubResponse.isEmpty()) {
                return Optional.empty();
            }
            GlobalQuoteItem quote = new GlobalQuoteItem(
                    simbolo,
                    formatQuoteNumber(finnhubResponse.currentPrice()),
                    formatQuoteNumber(finnhubResponse.previousClose())
            );
            cachedGlobalQuotes.put(simbolo, quote);
            cachedGlobalQuotesAt.put(simbolo, LocalDateTime.now());
            markRemoteSyncSuccess();
            LOGGER.info("Cache actualizado para FINNHUB_QUOTE de {}", simbolo);
            return Optional.of(quote);
        } catch (Exception e) {
            LOGGER.warn("Fallo al consultar Finnhub para {}: {}", simbolo, e.getMessage());
            return Optional.empty();
        }
    }

    private List<MarketStockResponse> persistAndMapRemoteItems(List<AlphaVantageMostActiveItem> remoteItems) {
        TipoActivoEntity tipoAccion = tipoActivoRepository.findByNombreIgnoreCase("accion")
                .orElseThrow(() -> new ResourceNotFoundException("No existe el tipo de activo accion"));
        EstadoActivoEntity estadoActivo = estadoActivoRepository.findByNombreIgnoreCase("activo")
                .orElseThrow(() -> new ResourceNotFoundException("No existe el estado de activo activo"));

        LocalDateTime snapshotTime = LocalDateTime.now().withSecond(0).withNano(0);

        return remoteItems.stream()
                .limit(8)
                .map(item -> upsertAssetSnapshot(item, tipoAccion, estadoActivo, snapshotTime))
                .toList();
    }

    private MarketStockResponse upsertAssetSnapshot(
            AlphaVantageMostActiveItem item,
            TipoActivoEntity tipoAccion,
            EstadoActivoEntity estadoActivo,
            LocalDateTime snapshotTime
    ) {
        String symbol = item.ticker().trim().toUpperCase(Locale.ROOT);
        BigDecimal currentPrice = parseDecimal(item.price());

        ActivoEntity activo = activoRepository.findBySimboloIgnoreCase(symbol)
                .orElseGet(ActivoEntity::new);

        activo.setNombre(buildName(symbol));
        activo.setSimbolo(symbol);
        activo.setTipoActivo(tipoAccion);
        activo.setEstadoActivo(estadoActivo);
        activo.setPrecioActual(currentPrice);
        activo.setMercado("USA");
        activo.setMoneda("USD");
        ActivoEntity savedAsset = activoRepository.save(activo);

        HistorialPrecioEntity snapshot = historialPrecioRepository
                .findByActivoIdAndFecha(savedAsset.getId(), snapshotTime)
                .orElseGet(HistorialPrecioEntity::new);

        snapshot.setActivo(savedAsset);
        snapshot.setFecha(snapshotTime);
        snapshot.setPrecioApertura(currentPrice);
        snapshot.setPrecioMaximo(currentPrice);
        snapshot.setPrecioMinimo(currentPrice);
        snapshot.setPrecioCierre(currentPrice);
        historialPrecioRepository.save(snapshot);

        return new MarketStockResponse(
                savedAsset.getId(),
                savedAsset.getNombre(),
                savedAsset.getSimbolo(),
                formatPrice(currentPrice),
                parseVariation(item.changePercentage()),
                formatVolume(item.volume()),
                buildLogoText(symbol),
                LOGO_CLASSES.get(Math.floorMod(symbol.hashCode(), LOGO_CLASSES.size()))
        );
    }

    private MarketStockResponse mapStoredAsset(ActivoEntity activo) {
        List<HistorialPrecioEntity> latestPrices = historialPrecioRepository.findTop2ByActivoIdOrderByFechaDesc(activo.getId());

        return new MarketStockResponse(
                activo.getId(),
                activo.getNombre(),
                activo.getSimbolo(),
                formatPrice(activo.getPrecioActual()),
                calculateDailyChangePercent(latestPrices),
                resolveStoredVolume(activo.getSimbolo()),
                buildLogoText(activo.getSimbolo()),
                LOGO_CLASSES.get(Math.floorMod(activo.getSimbolo().hashCode(), LOGO_CLASSES.size()))
        );
    }

    private void ensureLocalMarketData() {
        if (!activoRepository.findAllByOrderBySimboloAsc().isEmpty()) {
            return;
        }

        TipoActivoEntity tipoAccion = tipoActivoRepository.findByNombreIgnoreCase("accion")
                .orElseThrow(() -> new ResourceNotFoundException("No existe el tipo de activo accion"));
        EstadoActivoEntity estadoActivo = estadoActivoRepository.findByNombreIgnoreCase("activo")
                .orElseThrow(() -> new ResourceNotFoundException("No existe el estado de activo activo"));

        LocalDate today = LocalDate.now();
        LocalDateTime currentSnapshotTime = today.atTime(16, 0);
        LocalDateTime previousSnapshotTime = today.minusDays(1).atTime(16, 0);

        for (DefaultMarketAsset defaultAsset : DEFAULT_MARKET_ASSETS) {
            ActivoEntity activo = new ActivoEntity();
            activo.setNombre(defaultAsset.nombre());
            activo.setSimbolo(defaultAsset.simbolo());
            activo.setTipoActivo(tipoAccion);
            activo.setEstadoActivo(estadoActivo);
            activo.setPrecioActual(parseDecimal(defaultAsset.currentPrice()));
            activo.setMercado(defaultAsset.market());
            activo.setMoneda(defaultAsset.currency());
            ActivoEntity savedAsset = activoRepository.save(activo);

            HistorialPrecioEntity previousSnapshot = new HistorialPrecioEntity();
            previousSnapshot.setActivo(savedAsset);
            previousSnapshot.setFecha(previousSnapshotTime);
            previousSnapshot.setPrecioApertura(parseDecimal(defaultAsset.previousClose()));
            previousSnapshot.setPrecioMaximo(parseDecimal(defaultAsset.previousClose()));
            previousSnapshot.setPrecioMinimo(parseDecimal(defaultAsset.previousClose()));
            previousSnapshot.setPrecioCierre(parseDecimal(defaultAsset.previousClose()));
            historialPrecioRepository.save(previousSnapshot);

            HistorialPrecioEntity currentSnapshot = new HistorialPrecioEntity();
            currentSnapshot.setActivo(savedAsset);
            currentSnapshot.setFecha(currentSnapshotTime);
            currentSnapshot.setPrecioApertura(parseDecimal(defaultAsset.currentPrice()));
            currentSnapshot.setPrecioMaximo(parseDecimal(defaultAsset.currentPrice()));
            currentSnapshot.setPrecioMinimo(parseDecimal(defaultAsset.currentPrice()));
            currentSnapshot.setPrecioCierre(parseDecimal(defaultAsset.currentPrice()));
            historialPrecioRepository.save(currentSnapshot);
        }
    }

    private String buildName(String ticker) {
        return ticker;
    }

    private String buildLogoText(String ticker) {
        return ticker.substring(0, Math.min(2, ticker.length())).toUpperCase(Locale.ROOT);
    }

    private String formatPrice(BigDecimal value) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(Locale.US);
        formatter.setMaximumFractionDigits(2);
        formatter.setMinimumFractionDigits(2);
        return formatter.format(value);
    }

    private String formatVolume(String value) {
        BigDecimal volume = parseDecimal(value);
        double numericVolume = volume.doubleValue();

        NumberFormat formatter = NumberFormat.getCompactNumberInstance(Locale.US, NumberFormat.Style.SHORT);
        formatter.setMaximumFractionDigits(1);
        return formatter.format(numericVolume);
    }

    private double parseVariation(String value) {
        String normalized = value.replace("%", "").trim();
        return parseDecimal(normalized).doubleValue();
    }

    private BigDecimal parseDecimal(String value) {
        try {
            return new BigDecimal(value.trim()).setScale(2, RoundingMode.HALF_UP);
        } catch (Exception exception) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
    }

    private double calculateDailyChangePercent(List<HistorialPrecioEntity> latestPrices) {
        if (latestPrices.size() < 2) {
            return 0.0;
        }

        BigDecimal current = latestPrices.get(0).getPrecioCierre();
        BigDecimal previous = latestPrices.get(1).getPrecioCierre();

        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }

        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous, 2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private String resolveStoredVolume(String simbolo) {
        return DEFAULT_MARKET_ASSETS.stream()
                .filter(asset -> asset.simbolo().equalsIgnoreCase(simbolo))
                .findFirst()
                .map(asset -> formatVolume(asset.volume()))
                .orElse("N/A");
    }

    private boolean isApiKeyConfigured(String apiKey) {
        return apiKey != null && !apiKey.isBlank();
    }

    private boolean hasAnyMarketApiKey() {
        return isApiKeyConfigured(alphaVantageApiKey) || isApiKeyConfigured(finnhubApiKey);
    }

    private boolean isCacheFresh(LocalDateTime cachedAt) {
        return cachedAt != null && cachedAt.isAfter(LocalDateTime.now().minusMinutes(CACHE_TTL_MINUTES));
    }

    private void markRemoteSyncSuccess() {
        lastRemoteSyncAt = LocalDateTime.now();
    }

    private String resolveLiveDataSource(boolean alphaKeyConfigured, boolean finnhubKeyConfigured, boolean quoteCacheFresh) {
        if (cachedMostActive != null && !cachedMostActive.isEmpty()) {
            return "alpha_vantage";
        }
        if (finnhubKeyConfigured && quoteCacheFresh) {
            return "finnhub";
        }
        if (alphaKeyConfigured) {
            return "alpha_vantage";
        }
        return finnhubKeyConfigured ? "finnhub" : "respaldo_local";
    }

    private String buildLiveDataMessage(String fuente) {
        return switch (fuente) {
            case "finnhub" -> "Cotizaciones en vivo desde Finnhub.";
            case "alpha_vantage" -> "Mercado sincronizado desde Alpha Vantage.";
            default -> "Datos de mercado actualizados.";
        };
    }

    private String formatQuoteNumber(Double value) {
        if (value == null) {
            return "0";
        }

        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).toPlainString();
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

    private record AlphaVantageResponse(
            @JsonProperty("most_actively_traded")
            List<AlphaVantageMostActiveItem> mostActivelyTraded,
            @JsonProperty("Information")
            String information,
            @JsonProperty("Note")
            String note,
            @JsonProperty("Error Message")
            String errorMessage
    ) {
        private List<AlphaVantageMostActiveItem> items() {
            return mostActivelyTraded != null ? mostActivelyTraded : List.of();
        }

        private boolean hasError() {
            return (information != null && !information.isBlank())
                    || (note != null && !note.isBlank())
                    || (errorMessage != null && !errorMessage.isBlank());
        }
    }

    private record AlphaVantageMostActiveItem(
            String ticker,
            String price,
            @JsonProperty("change_percentage")
            String changePercentage,
            String volume
    ) {
    }

    private record GlobalQuoteResponse(
            @JsonProperty("Global Quote")
            GlobalQuoteItem quote,
            @JsonProperty("Information")
            String information,
            @JsonProperty("Note")
            String note,
            @JsonProperty("Error Message")
            String errorMessage
    ) {
        private boolean hasError() {
            return (information != null && !information.isBlank())
                    || (note != null && !note.isBlank())
                    || (errorMessage != null && !errorMessage.isBlank());
        }
    }

    private record GlobalQuoteItem(
            @JsonProperty("01. symbol")
            String symbol,
            @JsonProperty("05. price")
            String price,
            @JsonProperty("08. previous close")
            String previousClose
    ) {
        private boolean isEmpty() {
            return symbol == null || symbol.isBlank() || price == null || price.isBlank();
        }
    }

    private record FinnhubQuoteResponse(
            @JsonProperty("c") Double currentPrice,
            @JsonProperty("pc") Double previousClose
    ) {
        private boolean isEmpty() {
            return currentPrice == null || currentPrice == 0;
        }
    }

    private record DefaultMarketAsset(
            String nombre,
            String simbolo,
            String market,
            String currency,
            String currentPrice,
            String previousClose,
            String volume
    ) {
    }
}
