import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./navItems";

export function LeftRail() {
  const { t } = useTranslation();

  return (
    <nav className="left-rail" aria-label={t("common.appName")}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            isActive ? "left-rail__item left-rail__item--active" : "left-rail__item"
          }
        >
          <span className="left-rail__icon" aria-hidden="true">
            <item.icon />
          </span>
          <span className="left-rail__label">
            {item.mystery && (
              <span className="left-rail__mystery-mark" aria-hidden="true">
                ✦{" "}
              </span>
            )}
            {t(item.labelKey)}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}
