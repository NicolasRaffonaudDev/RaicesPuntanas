import { lazyWithPreload } from "../utils/lazyWithPreload";

export const HomePage = lazyWithPreload(() => import("../pages/Home"));
export const LotesPage = lazyWithPreload(() => import("../pages/Lotes"));
export const FavoritosPage = lazyWithPreload(() => import("../pages/Favoritos"));
export const CompararLotesPage = lazyWithPreload(() => import("../pages/CompararLotes"));
export const ContactPage = lazyWithPreload(() => import("../pages/Contact"));
export const LoginPage = lazyWithPreload(() => import("../pages/Login"));
export const RegisterPage = lazyWithPreload(() => import("../pages/Register"));
export const SetupAdminPage = lazyWithPreload(() => import("../pages/SetupAdmin"));
export const DashboardPage = lazyWithPreload(() => import("../pages/Dashboard"));
export const MiPanelUsuarioPage = lazyWithPreload(() => import("../pages/MiPanelUsuario"));
export const GestionComercialPage = lazyWithPreload(() => import("../pages/GestionComercial"));
export const ConsultasInboxPage = lazyWithPreload(() => import("../pages/ConsultasInbox"));
export const SettingsModulePage = lazyWithPreload(() => import("../pages/SettingsModule"));

export const preloaders = {
  home: HomePage.preload,
  lotes: LotesPage.preload,
  favoritos: FavoritosPage.preload,
  comparar: CompararLotesPage.preload,
  contacto: ContactPage.preload,
  login: LoginPage.preload,
  register: RegisterPage.preload,
  setupAdmin: SetupAdminPage.preload,
  dashboard: DashboardPage.preload,
  miPanel: MiPanelUsuarioPage.preload,
  gestion: GestionComercialPage.preload,
  consultas: ConsultasInboxPage.preload,
  settingsModule: SettingsModulePage.preload,
};
