# Use official Maven image with JDK
FROM maven:3.8.4-openjdk-17

COPY . .
# Set working directory
WORKDIR /app

# Copy the pom.xml file
COPY pom.xml .

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
COPY --from=build /target/*.jar /app/app.jar
# Expose port (typically 8080 for Spring Boot apps)
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/*.jar"]