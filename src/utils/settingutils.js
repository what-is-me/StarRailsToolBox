import * as fs from "fs";
import { getGamePathFromRegister } from "@/utils/register";
import { PROGRAM_DATA_DIR, SETTING_PATH } from "@/utils/path_config";
import { getGachaUrl } from "@/utils/gachautils";

export class Setting {
  constructor() {
    this.game_path = "";
  }
}

/**
 * 保存设置
 * @param setting
 */
export function saveSetting(setting) {
  fs.mkdirSync(PROGRAM_DATA_DIR, { recursive: true });
  return fs.writeFileSync(SETTING_PATH, JSON.stringify(setting), "utf-8");
}

/**
 * 初始化设置
 * @returns {Setting}
 */
export function initSetting() {
  const setting = new Setting();
  setting.game_path = getGamePathFromRegister();
  setting.gacha_url = getGachaUrl();
  return setting;
}

/**
 * 加载设置
 * @returns {Setting|any}
 */
export function loadSetting() {
  try {
    fs.accessSync(SETTING_PATH, fs.constants.R_OK | fs.constants.W_OK);
    return JSON.parse(fs.readFileSync(SETTING_PATH, "utf-8"));
  } catch (err) {
    const setting = initSetting();
    saveSetting(setting);
    return setting;
  }
}
