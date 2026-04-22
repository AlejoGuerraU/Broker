package com.broker.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BrokerBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BrokerBackendApplication.class, args);
    }
}
