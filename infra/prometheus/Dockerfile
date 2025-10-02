FROM prom/prometheus:v3.4.2

COPY ./prometheus.yml /etc/prometheus/prometheus.yml
COPY ./alert_rules.yml /etc/prometheus/alert_rules.yml

CMD ["--config.file=/etc/prometheus/prometheus.yml", "--storage.tsdb.path=/prometheus", "--web.console.libraries=/etc/prometheus/console_libraries", "--web.console.templates=/etc/prometheus/consoles", "--web.external-url=http://blackholejs.art/prometheus/"]