const telemetryService = {
  ingestWebVital: async ({ payload }) => {
    const event = {
      type: "web_vital",
      at: new Date().toISOString(),
      ...payload,
    };

    if (process.env.NODE_ENV !== "production") {
      console.info("[telemetry:web-vitals]", JSON.stringify(event));
    }

    return event;
  },
};

module.exports = { telemetryService };
