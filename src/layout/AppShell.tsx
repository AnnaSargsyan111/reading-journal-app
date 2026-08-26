import { Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LeftRail } from "./LeftRail";
import { BottomNav } from "./BottomNav";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useAuth } from "../context/AuthContext";
import { LogoutIcon } from "../components/icons";

export function AppShell() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <LeftRail />
      <main className="app-main">
        <div className="page-header">
          <div />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LanguageSwitcher />
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>
              <LogoutIcon width={16} height={16} />
              {t("nav.logout")}
            </button>
          </div>
        </div>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
