package com.broker.backend.service;

import com.broker.backend.exception.BusinessException;
import com.broker.backend.model.market.MarketFundamentalAnalysisResponse;
import com.broker.backend.persistence.entity.ActivoEntity;
import com.broker.backend.persistence.entity.AnalisisFundamentalAccionEntity;
import com.broker.backend.persistence.repository.ActivoRepository;
import com.broker.backend.persistence.repository.AnalisisFundamentalAccionRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional(readOnly = true)
public class FundamentalAnalysisService {

    private static final Logger LOGGER = LoggerFactory.getLogger(FundamentalAnalysisService.class);
    private static final int CACHE_DAYS = 7;
    private static final long CACHE_TTL_MINUTES = 15;

    // ── In-memory cache (evita llamadas duplicadas a la API en la misma sesion) ──
    private final Map<String, OverviewItem> cachedOverviews = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> cachedOverviewsAt = new ConcurrentHashMap<>();

    private final RestClient restClient;
    private final AnalisisFundamentalAccionRepository analisisFundamentalAccionRepository;
    private final ActivoRepository activoRepository;
    private final String alphaVantageApiKey;

    public FundamentalAnalysisService(
            RestClient.Builder restClientBuilder,
            AnalisisFundamentalAccionRepository analisisFundamentalAccionRepository,
            ActivoRepository activoRepository,
            @Value("${alpha.vantage.api-key:${ALPHA_VANTAGE_API_KEY:}}") String alphaVantageApiKey
    ) {
        this.restClient = restClientBuilder
                .baseUrl("https://www.alphavantage.co")
                .build();
        this.analisisFundamentalAccionRepository = analisisFundamentalAccionRepository;
        this.activoRepository = activoRepository;
        this.alphaVantageApiKey = alphaVantageApiKey;
    }

    @Transactional
    public MarketFundamentalAnalysisResponse getFundamentalAnalysis(String simbolo) {
        String normalizedSymbol = normalizeSymbol(simbolo);
        Optional<AnalisisFundamentalAccionEntity> persistedAnalysis = analisisFundamentalAccionRepository
                .findBySimboloIgnoreCase(normalizedSymbol);

        if (persistedAnalysis.filter(this::isFresh).isPresent()) {
            return mapToResponse(persistedAnalysis.get());
        }

        Optional<OverviewItem> overview = fetchOverview(normalizedSymbol);
        if (overview.isPresent()) {
            AnalisisFundamentalAccionEntity savedAnalysis = persistOverview(normalizedSymbol, overview.get(), persistedAnalysis.orElse(null));
            return mapToResponse(savedAnalysis);
        }

        if (persistedAnalysis.isPresent()) {
            return mapToResponse(persistedAnalysis.get());
        }

        throw new BusinessException("No fue posible obtener el analisis fundamental para " + normalizedSymbol);
    }

    private boolean isFresh(AnalisisFundamentalAccionEntity analysis) {
        return analysis.getFechaActualizacion() != null
                && !analysis.getFechaActualizacion().isBefore(LocalDateTime.now().minusDays(CACHE_DAYS));
    }

    private String normalizeSymbol(String simbolo) {
        if (simbolo == null || simbolo.isBlank()) {
            throw new BusinessException("El simbolo es obligatorio para consultar el analisis fundamental");
        }
        return simbolo.trim().toUpperCase(Locale.ROOT);
    }

    private Optional<OverviewItem> fetchOverview(String simbolo) {
        if (alphaVantageApiKey == null || alphaVantageApiKey.isBlank()) {
            LOGGER.warn("ALPHA_VANTAGE_API_KEY no configurada. No se puede consultar OVERVIEW para {}.", simbolo);
            return Optional.empty();
        }

        // Serve from in-memory cache if still fresh
        LocalDateTime cachedAt = cachedOverviewsAt.get(simbolo);
        if (cachedAt != null && cachedAt.isAfter(LocalDateTime.now().minusMinutes(CACHE_TTL_MINUTES))) {
            LOGGER.debug("Cache hit en memoria para OVERVIEW de {}", simbolo);
            return Optional.of(cachedOverviews.get(simbolo));
        }

        try {
            OverviewItem response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/query")
                            .queryParam("function", "OVERVIEW")
                            .queryParam("symbol", simbolo)
                            .queryParam("apikey", alphaVantageApiKey)
                            .build())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(OverviewItem.class);

            if (response == null) {
                LOGGER.warn("Alpha Vantage devolvio respuesta nula para OVERVIEW de {}.", simbolo);
                return Optional.empty();
            }

            if (response.hasRateLimit()) {
                LOGGER.warn("Rate limit alcanzado en Alpha Vantage para OVERVIEW de {}. Mensaje: {}",
                        simbolo, response.information() != null ? response.information() : response.note());
                return Optional.empty();
            }

            if (response.hasError()) {
                LOGGER.warn("Error en respuesta de Alpha Vantage para OVERVIEW de {}. Error: {}",
                        simbolo, response.errorMessage());
                return Optional.empty();
            }

            if (response.isEmpty()) {
                LOGGER.warn("Alpha Vantage devolvio OVERVIEW vacio (sin simbolo) para {}.", simbolo);
                return Optional.empty();
            }

            cachedOverviews.put(simbolo, response);
            cachedOverviewsAt.put(simbolo, LocalDateTime.now());
            LOGGER.info("Cache en memoria actualizado para OVERVIEW de {}", simbolo);
            return Optional.of(response);
        } catch (Exception exception) {
            LOGGER.warn("Fallo al consultar OVERVIEW de Alpha Vantage para {}: {}", simbolo, exception.getMessage());
            return Optional.empty();
        }
    }

    private AnalisisFundamentalAccionEntity persistOverview(
            String simbolo,
            OverviewItem overview,
            AnalisisFundamentalAccionEntity existingAnalysis
    ) {
        AnalisisFundamentalAccionEntity analysis = existingAnalysis != null
                ? existingAnalysis
                : new AnalisisFundamentalAccionEntity();

        analysis.setSimbolo(simbolo);
        analysis.setActivo(resolveLinkedAsset(simbolo));
        analysis.setNombreEmpresa(firstNonBlank(overview.name(), simbolo));
        analysis.setDescripcion(blankToNull(overview.description()));
        analysis.setMercado(blankToNull(overview.exchange()));
        analysis.setMoneda(blankToNull(overview.currency()));
        analysis.setPais(blankToNull(overview.country()));
        analysis.setSector(blankToNull(overview.sector()));
        analysis.setIndustria(blankToNull(overview.industry()));
        analysis.setCapitalizacionMercado(parseDecimalOrNull(overview.marketCapitalization()));
        analysis.setEbitda(parseDecimalOrNull(overview.ebitda()));
        analysis.setPerRatio(parseDecimalOrNull(overview.peRatio()));
        analysis.setForwardPer(parseDecimalOrNull(overview.forwardPe()));
        analysis.setPegRatio(parseDecimalOrNull(overview.pegRatio()));
        analysis.setPriceToSalesRatioTtm(parseDecimalOrNull(overview.priceToSalesRatioTtm()));
        analysis.setPriceToBookRatio(parseDecimalOrNull(overview.priceToBookRatio()));
        analysis.setEvToRevenue(parseDecimalOrNull(overview.evToRevenue()));
        analysis.setEvToEbitda(parseDecimalOrNull(overview.evToEbitda()));
        analysis.setBookValue(parseDecimalOrNull(overview.bookValue()));
        analysis.setDividendPerShare(parseDecimalOrNull(overview.dividendPerShare()));
        analysis.setDividendYield(parseDecimalOrNull(overview.dividendYield()));
        analysis.setEps(parseDecimalOrNull(overview.eps()));
        analysis.setRevenuePerShareTtm(parseDecimalOrNull(overview.revenuePerShareTtm()));
        analysis.setProfitMargin(parseDecimalOrNull(overview.profitMargin()));
        analysis.setOperatingMarginTtm(parseDecimalOrNull(overview.operatingMarginTtm()));
        analysis.setReturnOnAssetsTtm(parseDecimalOrNull(overview.returnOnAssetsTtm()));
        analysis.setReturnOnEquityTtm(parseDecimalOrNull(overview.returnOnEquityTtm()));
        analysis.setRevenueTtm(parseDecimalOrNull(overview.revenueTtm()));
        analysis.setGrossProfitTtm(parseDecimalOrNull(overview.grossProfitTtm()));
        analysis.setDilutedEpsTtm(parseDecimalOrNull(overview.dilutedEpsTtm()));
        analysis.setQuarterlyEarningsGrowthYoy(parseDecimalOrNull(overview.quarterlyEarningsGrowthYoy()));
        analysis.setQuarterlyRevenueGrowthYoy(parseDecimalOrNull(overview.quarterlyRevenueGrowthYoy()));
        analysis.setAnalystTargetPrice(parseDecimalOrNull(overview.analystTargetPrice()));
        analysis.setBeta(parseDecimalOrNull(overview.beta()));
        analysis.setWeek52High(parseDecimalOrNull(overview.week52High()));
        analysis.setWeek52Low(parseDecimalOrNull(overview.week52Low()));
        analysis.setMovingAverage50Day(parseDecimalOrNull(overview.movingAverage50Day()));
        analysis.setMovingAverage200Day(parseDecimalOrNull(overview.movingAverage200Day()));
        analysis.setSharesOutstanding(parseDecimalOrNull(overview.sharesOutstanding()));
        analysis.setDividendDate(blankToNull(overview.dividendDate()));
        analysis.setExDividendDate(blankToNull(overview.exDividendDate()));
        analysis.setFechaActualizacion(LocalDateTime.now());

        return analisisFundamentalAccionRepository.save(analysis);
    }

    private ActivoEntity resolveLinkedAsset(String simbolo) {
        return activoRepository.findBySimboloIgnoreCase(simbolo).orElse(null);
    }

    private String firstNonBlank(String candidate, String fallback) {
        String value = blankToNull(candidate);
        return value != null ? value : fallback;
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        if (trimmed.isEmpty() || "None".equalsIgnoreCase(trimmed) || "N/A".equalsIgnoreCase(trimmed) || "-".equals(trimmed)) {
            return null;
        }
        return trimmed;
    }

    private BigDecimal parseDecimalOrNull(String value) {
        String normalized = blankToNull(value);
        if (normalized == null) {
            return null;
        }

        try {
            return new BigDecimal(normalized);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private MarketFundamentalAnalysisResponse mapToResponse(AnalisisFundamentalAccionEntity analysis) {
        return new MarketFundamentalAnalysisResponse(
                analysis.getSimbolo(),
                analysis.getNombreEmpresa(),
                analysis.getDescripcion(),
                analysis.getMercado(),
                analysis.getMoneda(),
                analysis.getPais(),
                analysis.getSector(),
                analysis.getIndustria(),
                analysis.getCapitalizacionMercado(),
                analysis.getEbitda(),
                analysis.getPerRatio(),
                analysis.getForwardPer(),
                analysis.getPegRatio(),
                analysis.getPriceToSalesRatioTtm(),
                analysis.getPriceToBookRatio(),
                analysis.getEvToRevenue(),
                analysis.getEvToEbitda(),
                analysis.getBookValue(),
                analysis.getDividendPerShare(),
                analysis.getDividendYield(),
                analysis.getEps(),
                analysis.getRevenuePerShareTtm(),
                analysis.getProfitMargin(),
                analysis.getOperatingMarginTtm(),
                analysis.getReturnOnAssetsTtm(),
                analysis.getReturnOnEquityTtm(),
                analysis.getRevenueTtm(),
                analysis.getGrossProfitTtm(),
                analysis.getDilutedEpsTtm(),
                analysis.getQuarterlyEarningsGrowthYoy(),
                analysis.getQuarterlyRevenueGrowthYoy(),
                analysis.getAnalystTargetPrice(),
                analysis.getBeta(),
                analysis.getWeek52High(),
                analysis.getWeek52Low(),
                analysis.getMovingAverage50Day(),
                analysis.getMovingAverage200Day(),
                analysis.getSharesOutstanding(),
                analysis.getDividendDate(),
                analysis.getExDividendDate(),
                analysis.getFechaActualizacion()
        );
    }

    private record OverviewItem(
            @JsonProperty("Symbol")
            String symbol,
            @JsonProperty("Name")
            String name,
            @JsonProperty("Description")
            String description,
            @JsonProperty("Exchange")
            String exchange,
            @JsonProperty("Currency")
            String currency,
            @JsonProperty("Country")
            String country,
            @JsonProperty("Sector")
            String sector,
            @JsonProperty("Industry")
            String industry,
            @JsonProperty("MarketCapitalization")
            String marketCapitalization,
            @JsonProperty("EBITDA")
            String ebitda,
            @JsonProperty("PERatio")
            String peRatio,
            @JsonProperty("ForwardPE")
            String forwardPe,
            @JsonProperty("PEGRatio")
            String pegRatio,
            @JsonProperty("PriceToSalesRatioTTM")
            String priceToSalesRatioTtm,
            @JsonProperty("PriceToBookRatio")
            String priceToBookRatio,
            @JsonProperty("EVToRevenue")
            String evToRevenue,
            @JsonProperty("EVToEBITDA")
            String evToEbitda,
            @JsonProperty("BookValue")
            String bookValue,
            @JsonProperty("DividendPerShare")
            String dividendPerShare,
            @JsonProperty("DividendYield")
            String dividendYield,
            @JsonProperty("EPS")
            String eps,
            @JsonProperty("RevenuePerShareTTM")
            String revenuePerShareTtm,
            @JsonProperty("ProfitMargin")
            String profitMargin,
            @JsonProperty("OperatingMarginTTM")
            String operatingMarginTtm,
            @JsonProperty("ReturnOnAssetsTTM")
            String returnOnAssetsTtm,
            @JsonProperty("ReturnOnEquityTTM")
            String returnOnEquityTtm,
            @JsonProperty("RevenueTTM")
            String revenueTtm,
            @JsonProperty("GrossProfitTTM")
            String grossProfitTtm,
            @JsonProperty("DilutedEPSTTM")
            String dilutedEpsTtm,
            @JsonProperty("QuarterlyEarningsGrowthYOY")
            String quarterlyEarningsGrowthYoy,
            @JsonProperty("QuarterlyRevenueGrowthYOY")
            String quarterlyRevenueGrowthYoy,
            @JsonProperty("AnalystTargetPrice")
            String analystTargetPrice,
            @JsonProperty("Beta")
            String beta,
            @JsonProperty("52WeekHigh")
            String week52High,
            @JsonProperty("52WeekLow")
            String week52Low,
            @JsonProperty("50DayMovingAverage")
            String movingAverage50Day,
            @JsonProperty("200DayMovingAverage")
            String movingAverage200Day,
            @JsonProperty("SharesOutstanding")
            String sharesOutstanding,
            @JsonProperty("DividendDate")
            String dividendDate,
            @JsonProperty("ExDividendDate")
            String exDividendDate,
            @JsonProperty("Information")
            String information,
            @JsonProperty("Note")
            String note,
            @JsonProperty("Error Message")
            String errorMessage
    ) {
        private boolean hasRateLimit() {
            return (information != null && !information.isBlank())
                    || (note != null && !note.isBlank());
        }

        private boolean hasError() {
            return errorMessage != null && !errorMessage.isBlank();
        }

        private boolean isEmpty() {
            return symbol == null || symbol.isBlank();
        }
    }
}
