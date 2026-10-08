import http from 'node:http';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const ROUTES = [
  '/',
  '/en',
  '/en/watch',
  '/en/read',
  '/en/topics',
  '/en/about',
  '/en/read/why-your-name-stands-out-in-a-noisy-room',
  '/en/watch/why-your-name-gets-your-attention',
  '/ps',
  '/fa',
];

function measureHttp(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const start = performance.now();
    let ttfb = 0;

    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 80,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Benchmark/1.0',
        },
      },
      (res) => {
        ttfb = performance.now() - start;
        const chunks = [];

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const totalTime = performance.now() - start;
          const body = Buffer.concat(chunks);
          resolve({
            statusCode: res.statusCode,
            ttfbMs: Math.round(ttfb),
            totalTimeMs: Math.round(totalTime),
            sizeBytes: body.length,
          });
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const modeName = process.env.BENCH_MODE || 'Development Mode';
  console.log(`\n======================================================`);
  console.log(` BENCHMARKING: ${modeName} (${BASE_URL})`);
  console.log(`======================================================\n`);

  // Warmup the server with 1 request to avoid cold-compilation skew
  console.log('Warming up server...');
  try {
    await measureHttp(`${BASE_URL}/en`);
    console.log('Warmup complete.\n');
  } catch (e) {
    console.warn('Warmup failed, proceeding:', e.message);
  }

  const results = [];

  for (const route of ROUTES) {
    // Reset perf counters
    try {
      await fetch(`${BASE_URL}/api/perf-stats?action=reset`);
    } catch {}

    const measurement = await measureHttp(`${BASE_URL}${route}`);

    let stats = { sqlCount: 0, payloadCount: 0, duplicateQueries: [], slowestSql: [], totalSqlDurationMs: 0 };
    try {
      const statsRes = await fetch(`${BASE_URL}/api/perf-stats`);
      if (statsRes.ok) {
        stats = await statsRes.json();
      }
    } catch {}

    results.push({
      route,
      ...measurement,
      ...stats,
    });

    console.log(
      `✓ ${route.padEnd(48)} | TTFB: ${String(measurement.ttfbMs).padStart(5)}ms | Total: ${String(measurement.totalTimeMs).padStart(5)}ms | SQL: ${String(stats.sqlCount).padStart(3)} | Payload: ${String(stats.payloadCount).padStart(2)} | Size: ${(measurement.sizeBytes / 1024).toFixed(1)} KB`
    );
  }

  console.log('\n--- DETAILED SUMMARY TABLE ---');
  console.table(
    results.map((r) => ({
      Route: r.route,
      Status: r.statusCode,
      'TTFB (ms)': r.ttfbMs,
      'Total (ms)': r.totalTimeMs,
      'Size (KB)': (r.sizeBytes / 1024).toFixed(1),
      'SQL Queries': r.sqlCount,
      'Payload Calls': r.payloadCount,
      'SQL Time (ms)': r.totalSqlDurationMs,
      'Duplicate SQL': r.duplicateQueries.reduce((acc, d) => acc + (d.count - 1), 0),
    }))
  );

  console.log('\n--- DUPLICATE QUERIES DETECTED ---');
  const allDuplicates = new Map();
  for (const r of results) {
    for (const d of r.duplicateQueries || []) {
      const key = d.sql.slice(0, 100);
      allDuplicates.set(key, Math.max(allDuplicates.get(key) || 0, d.count));
    }
  }
  for (const [sql, count] of allDuplicates.entries()) {
    console.log(`- Repeated ${count}x: ${sql}...`);
  }

  console.log('\n--- SLOWEST SQL QUERIES OBSERVED ---');
  const allSlow = [];
  for (const r of results) {
    for (const s of r.slowestSql || []) {
      allSlow.push(s);
    }
  }
  allSlow.sort((a, b) => b.durationMs - a.durationMs);
  for (const s of allSlow.slice(0, 5)) {
    console.log(`- ${s.durationMs}ms: ${s.sql.slice(0, 120)}...`);
  }

  return results;
}

run().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
