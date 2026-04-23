FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY Backend/pom.xml .
COPY Backend/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
# Solo copiamos el jar que no es "plain" (el ejecutable de Spring Boot)
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
# Usamos shell form para asegurar la expansión de $PORT si fuera necesario, 
# aunque Spring Boot ya lo leerá de application.properties
ENTRYPOINT ["java", "-jar", "app.jar"]
