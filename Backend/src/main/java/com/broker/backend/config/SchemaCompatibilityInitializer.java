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
                WHERE table_schema = current_schema()
                  AND table_name = 'tbl_persona'
                  AND column_name = 'google_sub'
                """, Integer.class);

        if (columnCount != null && columnCount > 0) {
            return;
        }

        LOGGER.warn("La columna tbl_persona.google_sub no existe. Se agregara automaticamente.");
        jdbcTemplate.execute("ALTER TABLE tbl_persona ADD COLUMN google_sub VARCHAR(255) NULL");
    }

    private void ensurePersonaGoogleSubUniqueIndex() {
        Integer indexCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM pg_indexes
                WHERE schemaname = current_schema()
                  AND tablename = 'tbl_persona'
                  AND indexname = 'uk_persona_google_sub'
                """, Integer.class);

        if (indexCount != null && indexCount > 0) {
            return;
        }

        LOGGER.warn("El indice unico uk_persona_google_sub no existe. Se creara automaticamente.");
        jdbcTemplate.execute("ALTER TABLE tbl_persona ADD CONSTRAINT uk_persona_google_sub UNIQUE (google_sub)");
    }
}
