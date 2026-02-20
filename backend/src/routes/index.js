const { Router } = require("express");
const { authRoutes } = require("./auth-routes");
const { loteRoutes } = require("./lote-routes");
const { dashboardRoutes } = require("./dashboard-routes");
const { auditRoutes } = require("./audit-routes");
const { userRoutes } = require("./user-routes");
const { clienteRoutes } = require("./cliente-routes");
const { productoRoutes } = require("./producto-routes");
const { ventaRoutes } = require("./venta-routes");
const { inventarioRoutes } = require("./inventario-routes");

const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/lotes", loteRoutes);
apiRoutes.use("/dashboard", dashboardRoutes);
apiRoutes.use("/audit", auditRoutes);
apiRoutes.use("/users", userRoutes);
apiRoutes.use("/clientes", clienteRoutes);
apiRoutes.use("/productos", productoRoutes);
apiRoutes.use("/ventas", ventaRoutes);
apiRoutes.use("/inventario", inventarioRoutes);

module.exports = { apiRoutes };
