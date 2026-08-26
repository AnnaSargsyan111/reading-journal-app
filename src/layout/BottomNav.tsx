import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./navItems";

export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="bottom-nav" aria-label={t("common.appName")}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            isActive ? "bottom-nav__item bottom-nav__item--active" : "bottom-nav__item"
          }
        >
          <span className="bottom-nav__icon" aria-hidden="true">
            <item.icon width={20} height={20} />
          </span>
          <span>
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
