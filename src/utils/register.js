import { runSync } from "@/utils/cmd";
const path = require("path");
const fs = require("fs");

/**
 * 从注册表获取游戏登录器路径
 * @returns {*|null}
 */
export function getLauncherPathFromRegister() {
  const command =
    "powershell Get-ItemPropertyValue Registry::HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\崩坏：星穹铁道 InstallPath";
  const ret = runSync(command).data;
  if (ret === null) return null;
  return ret.trim();
}

/**
 * 从登录器路径获取游戏路径
 * @returns {string|null}
 */
export function getGamePathFromRegister() {
  const launcher_path = getLauncherPathFromRegister();
  if (launcher_path === null) return null;
  const config_path = path.join(launcher_path, "config.ini");
  const config = fs.readFileSync(config_path, { encoding: "utf8" });
  for (const row of config.split("\n")) {
    const key = "game_install_path=";
    const index = row.lastIndexOf(key);
    if (index !== -1) {
      return row.trim().substring(index + key.length);
    }
  }
  return null;
}
