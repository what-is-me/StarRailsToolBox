import path from "path";
import * as process from "process";
export const PROGRAM_DATA_DIR = path.join(
  process.env["APPDATA"].toString().trim(),
  "./star-rails-toolbox"
);
export const WEB_CACHE_PATH =
  "StarRail_Data\\webCaches\\2.15.0.0\\Cache\\Cache_Data\\data_2";
export const SETTING_PATH = path.join(PROGRAM_DATA_DIR, "./setting.json");
export const ACCOUNT_DIR = path.join(PROGRAM_DATA_DIR, "account");
