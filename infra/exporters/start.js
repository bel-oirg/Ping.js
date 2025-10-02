const spawn = require('cross-spawn');
function run(name, cmd, args, env = {}) {
  const p = spawn(cmd, args, { env: { ...process.env, ...env } });

  p.stdout.on('data', d => console.log(`[${name}] ${d}`));
  p.stderr.on('data', d => console.error(`[${name} ERROR] ${d}`));
  p.on('exit', code => console.error(`[${name}] exited with code ${code}`));
}

// Launch exporters
// run('node_exporter', 'node_exporter', ['--web.listen-address=:9100']);
run('redis_exporter', 'redis_exporter', ['--web.listen-address=:9121'], {
  REDIS_ADDR: 'redis://redis:6379',
});

run('postgres_exporter', 'postgres_exporter', ['--web.listen-address=:9187'], {
  DATA_SOURCE_NAME: process.env.DATA_SOURCE_NAME,
});

run('kafka_exporter', 'kafka_exporter', ['--kafka.server=kafka:9092', '--web.listen-address=:9308']);

run('nginx_exporter', 'nginx-prometheus-exporter', [
  '--nginx.scrape-uri=http://nginx:80/stub_status',
  '--web.listen-address=:9113',
]);