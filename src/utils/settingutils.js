import * as fs from "fs";
import { getGamePathFromRegister } from "@/utils/register";

export class Setting {
  constructor() {
    this.game_path = "";
  }
}
const SETTING_PATH = "./setting.json";
export function saveSetting(setting) {
  return fs.writeFileSync(SETTING_PATH, JSON.stringify(setting), "utf-8");
}
export function initSetting() {
  const setting = new Setting();
  setting.game_path = getGamePathFromRegister();
  return setting;
}
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
