import path from "path";
import * as process from "process";
export const PROGRAM_DATA_DIR = path.join(
  process.env["APPDATA"].toString().trim(),
  "./star-rails-toolbox"
);
export const SETTING_PATH = path.join(PROGRAM_DATA_DIR, "./setting.json");
export const ACCOUNT_DIR = path.join(PROGRAM_DATA_DIR, "account");
