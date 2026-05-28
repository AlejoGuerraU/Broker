package com.broker.backend.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "tbl_analisis_fundamental_accion",
        uniqueConstraints = @UniqueConstraint(name = "uk_analisis_fundamental_simbolo", columnNames = "simbolo")
)
public class AnalisisFundamentalAccionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String simbolo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_activo")
    private ActivoEntity activo;

    @Column(name = "nombre_empresa", length = 200)
    private String nombreEmpresa;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 80)
    private String mercado;

    @Column(length = 10)
    private String moneda;

    @Column(length = 80)
    private String pais;

    @Column(length = 120)
    private String sector;

    @Column(length = 160)
    private String industria;

    @Column(name = "capitalizacion_mercado", precision = 24, scale = 2)
    private BigDecimal capitalizacionMercado;

    @Column(precision = 24, scale = 2)
    private BigDecimal ebitda;

    @Column(name = "per_ratio", precision = 19, scale = 6)
    private BigDecimal perRatio;

    @Column(name = "forward_per", precision = 19, scale = 6)
    private BigDecimal forwardPer;

    @Column(name = "peg_ratio", precision = 19, scale = 6)
    private BigDecimal pegRatio;

    @Column(name = "price_to_sales_ratio_ttm", precision = 19, scale = 6)
    private BigDecimal priceToSalesRatioTtm;

    @Column(name = "price_to_book_ratio", precision = 19, scale = 6)
    private BigDecimal priceToBookRatio;

    @Column(name = "ev_to_revenue", precision = 19, scale = 6)
    private BigDecimal evToRevenue;

    @Column(name = "ev_to_ebitda", precision = 19, scale = 6)
    private BigDecimal evToEbitda;

    @Column(name = "book_value", precision = 19, scale = 6)
    private BigDecimal bookValue;

    @Column(name = "dividend_per_share", precision = 19, scale = 6)
    private BigDecimal dividendPerShare;

    @Column(name = "dividend_yield", precision = 19, scale = 6)
    private BigDecimal dividendYield;

    @Column(precision = 19, scale = 6)
    private BigDecimal eps;

    @Column(name = "revenue_per_share_ttm", precision = 19, scale = 6)
    private BigDecimal revenuePerShareTtm;

    @Column(name = "profit_margin", precision = 19, scale = 6)
    private BigDecimal profitMargin;

    @Column(name = "operating_margin_ttm", precision = 19, scale = 6)
    private BigDecimal operatingMarginTtm;

    @Column(name = "return_on_assets_ttm", precision = 19, scale = 6)
    private BigDecimal returnOnAssetsTtm;

    @Column(name = "return_on_equity_ttm", precision = 19, scale = 6)
    private BigDecimal returnOnEquityTtm;

    @Column(name = "revenue_ttm", precision = 24, scale = 2)
    private BigDecimal revenueTtm;

    @Column(name = "gross_profit_ttm", precision = 24, scale = 2)
    private BigDecimal grossProfitTtm;

    @Column(name = "diluted_eps_ttm", precision = 19, scale = 6)
    private BigDecimal dilutedEpsTtm;

    @Column(name = "quarterly_earnings_growth_yoy", precision = 19, scale = 6)
    private BigDecimal quarterlyEarningsGrowthYoy;

    @Column(name = "quarterly_revenue_growth_yoy", precision = 19, scale = 6)
    private BigDecimal quarterlyRevenueGrowthYoy;

    @Column(name = "analyst_target_price", precision = 19, scale = 6)
    private BigDecimal analystTargetPrice;

    @Column(precision = 19, scale = 6)
    private BigDecimal beta;

    @Column(name = "week_52_high", precision = 19, scale = 6)
    private BigDecimal week52High;

    @Column(name = "week_52_low", precision = 19, scale = 6)
    private BigDecimal week52Low;

    @Column(name = "moving_average_50_day", precision = 19, scale = 6)
    private BigDecimal movingAverage50Day;

    @Column(name = "moving_average_200_day", precision = 19, scale = 6)
    private BigDecimal movingAverage200Day;

    @Column(name = "shares_outstanding", precision = 24, scale = 2)
    private BigDecimal sharesOutstanding;

    @Column(name = "dividend_date", length = 20)
    private String dividendDate;

    @Column(name = "ex_dividend_date", length = 20)
    private String exDividendDate;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (fechaActualizacion == null) {
            fechaActualizacion = now;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getSimbolo() {
        return simbolo;
    }

    public ActivoEntity getActivo() {
        return activo;
    }

    public String getNombreEmpresa() {
        return nombreEmpresa;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public String getMercado() {
        return mercado;
    }

    public String getMoneda() {
        return moneda;
    }

    public String getPais() {
        return pais;
    }

    public String getSector() {
        return sector;
    }

    public String getIndustria() {
        return industria;
    }

    public BigDecimal getCapitalizacionMercado() {
        return capitalizacionMercado;
    }

    public BigDecimal getEbitda() {
        return ebitda;
    }

    public BigDecimal getPerRatio() {
        return perRatio;
    }

    public BigDecimal getForwardPer() {
        return forwardPer;
    }

    public BigDecimal getPegRatio() {
        return pegRatio;
    }

    public BigDecimal getPriceToSalesRatioTtm() {
        return priceToSalesRatioTtm;
    }

    public BigDecimal getPriceToBookRatio() {
        return priceToBookRatio;
    }

    public BigDecimal getEvToRevenue() {
        return evToRevenue;
    }

    public BigDecimal getEvToEbitda() {
        return evToEbitda;
    }

    public BigDecimal getBookValue() {
        return bookValue;
    }

    public BigDecimal getDividendPerShare() {
        return dividendPerShare;
    }

    public BigDecimal getDividendYield() {
        return dividendYield;
    }

    public BigDecimal getEps() {
        return eps;
    }

    public BigDecimal getRevenuePerShareTtm() {
        return revenuePerShareTtm;
    }

    public BigDecimal getProfitMargin() {
        return profitMargin;
    }

    public BigDecimal getOperatingMarginTtm() {
        return operatingMarginTtm;
    }

    public BigDecimal getReturnOnAssetsTtm() {
        return returnOnAssetsTtm;
    }

    public BigDecimal getReturnOnEquityTtm() {
        return returnOnEquityTtm;
    }

    public BigDecimal getRevenueTtm() {
        return revenueTtm;
    }

    public BigDecimal getGrossProfitTtm() {
        return grossProfitTtm;
    }

    public BigDecimal getDilutedEpsTtm() {
        return dilutedEpsTtm;
    }

    public BigDecimal getQuarterlyEarningsGrowthYoy() {
        return quarterlyEarningsGrowthYoy;
    }

    public BigDecimal getQuarterlyRevenueGrowthYoy() {
        return quarterlyRevenueGrowthYoy;
    }

    public BigDecimal getAnalystTargetPrice() {
        return analystTargetPrice;
    }

    public BigDecimal getBeta() {
        return beta;
    }

    public BigDecimal getWeek52High() {
        return week52High;
    }

    public BigDecimal getWeek52Low() {
        return week52Low;
    }

    public BigDecimal getMovingAverage50Day() {
        return movingAverage50Day;
    }

    public BigDecimal getMovingAverage200Day() {
        return movingAverage200Day;
    }

    public BigDecimal getSharesOutstanding() {
        return sharesOutstanding;
    }

    public String getDividendDate() {
        return dividendDate;
    }

    public String getExDividendDate() {
        return exDividendDate;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setSimbolo(String simbolo) {
        this.simbolo = simbolo;
    }

    public void setActivo(ActivoEntity activo) {
        this.activo = activo;
    }

    public void setNombreEmpresa(String nombreEmpresa) {
        this.nombreEmpresa = nombreEmpresa;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public void setMercado(String mercado) {
        this.mercado = mercado;
    }

    public void setMoneda(String moneda) {
        this.moneda = moneda;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public void setIndustria(String industria) {
        this.industria = industria;
    }

    public void setCapitalizacionMercado(BigDecimal capitalizacionMercado) {
        this.capitalizacionMercado = capitalizacionMercado;
    }

    public void setEbitda(BigDecimal ebitda) {
        this.ebitda = ebitda;
    }

    public void setPerRatio(BigDecimal perRatio) {
        this.perRatio = perRatio;
    }

    public void setForwardPer(BigDecimal forwardPer) {
        this.forwardPer = forwardPer;
    }

    public void setPegRatio(BigDecimal pegRatio) {
        this.pegRatio = pegRatio;
    }

    public void setPriceToSalesRatioTtm(BigDecimal priceToSalesRatioTtm) {
        this.priceToSalesRatioTtm = priceToSalesRatioTtm;
    }

    public void setPriceToBookRatio(BigDecimal priceToBookRatio) {
        this.priceToBookRatio = priceToBookRatio;
    }

    public void setEvToRevenue(BigDecimal evToRevenue) {
        this.evToRevenue = evToRevenue;
    }

    public void setEvToEbitda(BigDecimal evToEbitda) {
        this.evToEbitda = evToEbitda;
    }

    public void setBookValue(BigDecimal bookValue) {
        this.bookValue = bookValue;
    }

    public void setDividendPerShare(BigDecimal dividendPerShare) {
        this.dividendPerShare = dividendPerShare;
    }

    public void setDividendYield(BigDecimal dividendYield) {
        this.dividendYield = dividendYield;
    }

    public void setEps(BigDecimal eps) {
        this.eps = eps;
    }

    public void setRevenuePerShareTtm(BigDecimal revenuePerShareTtm) {
        this.revenuePerShareTtm = revenuePerShareTtm;
    }

    public void setProfitMargin(BigDecimal profitMargin) {
        this.profitMargin = profitMargin;
    }

    public void setOperatingMarginTtm(BigDecimal operatingMarginTtm) {
        this.operatingMarginTtm = operatingMarginTtm;
    }

    public void setReturnOnAssetsTtm(BigDecimal returnOnAssetsTtm) {
        this.returnOnAssetsTtm = returnOnAssetsTtm;
    }

    public void setReturnOnEquityTtm(BigDecimal returnOnEquityTtm) {
        this.returnOnEquityTtm = returnOnEquityTtm;
    }

    public void setRevenueTtm(BigDecimal revenueTtm) {
        this.revenueTtm = revenueTtm;
    }

    public void setGrossProfitTtm(BigDecimal grossProfitTtm) {
        this.grossProfitTtm = grossProfitTtm;
    }

    public void setDilutedEpsTtm(BigDecimal dilutedEpsTtm) {
        this.dilutedEpsTtm = dilutedEpsTtm;
    }

    public void setQuarterlyEarningsGrowthYoy(BigDecimal quarterlyEarningsGrowthYoy) {
        this.quarterlyEarningsGrowthYoy = quarterlyEarningsGrowthYoy;
    }

    public void setQuarterlyRevenueGrowthYoy(BigDecimal quarterlyRevenueGrowthYoy) {
        this.quarterlyRevenueGrowthYoy = quarterlyRevenueGrowthYoy;
    }

    public void setAnalystTargetPrice(BigDecimal analystTargetPrice) {
        this.analystTargetPrice = analystTargetPrice;
    }

    public void setBeta(BigDecimal beta) {
        this.beta = beta;
    }

    public void setWeek52High(BigDecimal week52High) {
        this.week52High = week52High;
    }

    public void setWeek52Low(BigDecimal week52Low) {
        this.week52Low = week52Low;
    }

    public void setMovingAverage50Day(BigDecimal movingAverage50Day) {
        this.movingAverage50Day = movingAverage50Day;
    }

    public void setMovingAverage200Day(BigDecimal movingAverage200Day) {
        this.movingAverage200Day = movingAverage200Day;
    }

    public void setSharesOutstanding(BigDecimal sharesOutstanding) {
        this.sharesOutstanding = sharesOutstanding;
    }

    public void setDividendDate(String dividendDate) {
        this.dividendDate = dividendDate;
    }

    public void setExDividendDate(String exDividendDate) {
        this.exDividendDate = exDividendDate;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}
