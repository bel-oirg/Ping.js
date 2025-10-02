FROM node:20-slim

WORKDIR /app

# Install curl and clean up
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install exporters
RUN curl -L https://github.com/prometheus/node_exporter/releases/download/v1.9.1/node_exporter-1.9.1.linux-amd64.tar.gz | tar xz && \
    mv node_exporter-1.9.1.linux-amd64/node_exporter /usr/local/bin && \
    rm -rf node_exporter-1.9.1.linux-amd64*

RUN curl -L https://github.com/oliver006/redis_exporter/releases/download/v1.74.0/redis_exporter-v1.74.0.linux-amd64.tar.gz | tar xz && \
    mv redis_exporter-v1.74.0.linux-amd64/redis_exporter /usr/local/bin && \
    rm -rf redis_exporter-v1.74.0.linux-amd64*

RUN curl -L https://github.com/prometheus-community/postgres_exporter/releases/download/v0.17.1/postgres_exporter-0.17.1.linux-amd64.tar.gz | tar xz && \
    mv postgres_exporter-0.17.1.linux-amd64/postgres_exporter /usr/local/bin && \
    rm -rf postgres_exporter-0.17.1.linux-amd64*

RUN curl -L https://github.com/danielqsj/kafka_exporter/releases/download/v1.7.0/kafka_exporter-1.7.0.linux-amd64.tar.gz | tar xz && \
    mv kafka_exporter-1.7.0.linux-amd64/kafka_exporter /usr/local/bin && \
    rm -rf kafka_exporter-1.7.0.linux-amd64*

RUN curl -L https://github.com/nginx/nginx-prometheus-exporter/releases/download/v1.4.2/nginx-prometheus-exporter_1.4.2_linux_amd64.tar.gz | tar xz && \
    mv nginx-prometheus-exporter /usr/local/bin && \
    rm -f nginx-prometheus-exporter_1.4.2_linux_amd64.tar.gz

# Copy app files
COPY . .

# Install dependencies
RUN npm install

# Expose ports
EXPOSE 9100 9121 9187 9308 9113 3000

# Start script
CMD ["node", "start.js"]
