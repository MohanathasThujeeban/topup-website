# Build stage
FROM maven:3.8.4-openjdk-17 AS build

# Set working directory
WORKDIR /app

# Copy the pom.xml file
COPY pom.xml .

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage - Use Eclipse Temurin (recommended replacement for OpenJDK)
FROM eclipse-temurin:17-jre-jammy

# Set working directory
WORKDIR /app

# Copy the jar from build stage
COPY --from=build /app/target/demo-0.0.1-SNAPSHOT.jar app.jar

# Expose port (typically 8080 for Spring Boot apps)
EXPOSE 8080

# Run the application with optimized JVM settings
CMD ["java", "-Xmx512m", "-Xms256m", "-jar", "app.jar"]