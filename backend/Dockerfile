# Estágio 1: Build (Igual)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests


# Estágio 2: Runtime
FROM eclipse-temurin:21-jre

# --- MAGICA DO FUSO HORÁRIO ---
ENV TZ=America/Rio_Branco
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
# ------------------------------

# >>> A MÁGICA DOS SCHEMAS ACONTECE AQUI <<<
# Cria a pasta física no Linux do contêiner
RUN mkdir -p /app/schemas
# Copia a pasta de schemas do Estágio 1 (build) para a pasta física do Estágio 2
COPY --from=build /app/src/main/resources/schemas /app/schemas
# >>> ---------------------------------- <<<

# Copiamos o JAR direto para a RAIZ com um nome simples
COPY --from=build /app/target/*.jar /main-app.jar

# Damos permissão total de leitura e execução
RUN chmod +x /main-app.jar

EXPOSE 8080

# Usamos o comando direto, sem colchetes, apontando para a raiz
ENTRYPOINT java -Xmx1g -Xms512m -jar /main-app.jar