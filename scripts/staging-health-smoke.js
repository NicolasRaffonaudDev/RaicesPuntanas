const DEFAULT_BACKEND_URL = "https://backend-production-a499.up.railway.app";
const DEFAULT_FRONTEND_URL = "https://frontend-production-1cb7e.up.railway.app";

const backendUrl = (process.env.BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
const frontendUrl = (process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL).replace(/\/+$/, "");

const checks = [
  { label: "backend /health", url: `${backendUrl}/health` },
  { label: "backend /api/lotes?limit=1", url: `${backendUrl}/api/lotes?limit=1` },
  { label: "frontend /nginx-health", url: `${frontendUrl}/nginx-health` },
  { label: "frontend /api/lotes?limit=1", url: `${frontendUrl}/api/lotes?limit=1` },
];

const truncate = (value, max = 180) => {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max)}...` : value;
};

const run = async () => {
  let hasFailure = false;

  console.log(`[smoke:railway] backend=${backendUrl}`);
  console.log(`[smoke:railway] frontend=${frontendUrl}`);

  for (const check of checks) {
    try {
      const response = await fetch(check.url, {
        method: "GET",
        headers: { Accept: "application/json,text/plain,*/*" },
      });

      const body = await response.text();
      const preview = truncate(body.replace(/\s+/g, " ").trim());

      if (response.ok) {
        console.log(`? OK ${check.label} [${response.status}] ${preview}`);
      } else {
        hasFailure = true;
        console.error(`? FAIL ${check.label} [${response.status}] ${preview}`);
      }
    } catch (error) {
      hasFailure = true;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`? FAIL ${check.label} [network] ${truncate(message)}`);
    }
  }

  if (hasFailure) {
    process.exitCode = 1;
    console.error("[smoke:railway] finished with failures");
    return;
  }

  console.log("[smoke:railway] all checks passed");
};

void run();
