package com.broker.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaCompatibilityInitializer implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(SchemaCompatibilityInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public SchemaCompatibilityInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensurePersonaGoogleSubColumn();
        ensurePersonaGoogleSubUniqueIndex();
    }

    private void ensurePersonaGoogleSubColumn() {
        Integer columnCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = 'tbl_persona'
                  AND column_name = 'google_sub'
                """, Integer.class);

        if (columnCount != null && columnCount > 0) {
            return;
        }

        LOGGER.warn("La columna tbl_persona.google_sub no existe. Se agregara automaticamente.");
        jdbcTemplate.execute("ALTER TABLE tbl_persona ADD COLUMN google_sub VARCHAR(255) NULL AFTER correo");
    }

    private void ensurePersonaGoogleSubUniqueIndex() {
        Integer indexCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM information_schema.statistics
                WHERE table_schema = DATABASE()
                  AND table_name = 'tbl_persona'
                  AND index_name = 'uk_persona_google_sub'
                """, Integer.class);

        if (indexCount != null && indexCount > 0) {
            return;
        }

        LOGGER.warn("El indice unico uk_persona_google_sub no existe. Se creara automaticamente.");
        jdbcTemplate.execute("ALTER TABLE tbl_persona ADD UNIQUE KEY uk_persona_google_sub (google_sub)");
    }
}
