import { loadSetting } from "@/utils/settingutils";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
import { ElMessage } from "element-plus";
const WEB_CACHE_PATH = "StarRail_Data\\webCaches\\Cache\\Cache_Data\\data_2";
const sleep = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

/**
 * @returns {string|null} base url of gacha, null if not find
 */
export function getGachaBaseUrl() {
  const game_path = loadSetting().game_path;
  const web_cache_path = path.join(game_path, WEB_CACHE_PATH);
  try {
    const web_cache = fs.readFileSync(web_cache_path, { encoding: "utf-8" });
    //console.log(web_cache);
    const gachaUrls = [...web_cache.matchAll("https://api[!-z]+")];
    //console.log(gachaUrls);
    if (gachaUrls.length === 0) return null;
    let gachaUrl = gachaUrls[gachaUrls.length - 1][0];
    gachaUrl = gachaUrl.replaceAll(/&gacha_type=\d+/g, "");
    gachaUrl = gachaUrl.replaceAll(/&page=\d+/g, "");
    gachaUrl = gachaUrl.replaceAll(/&size=\d+/g, "");
    gachaUrl = gachaUrl.replaceAll(/&end_id=\d+/g, "");
    return gachaUrl;
  } catch (err) {
    return null;
  }
}
export const GachaTypes = [
  {
    name_ch: "群星跃迁",
    name: "StellarWarp",
    code: 1,
  },
  {
    name_ch: "始发跃迁",
    name: "DepartureWarp",
    code: 2,
  },
  {
    name_ch: "角色跃迁",
    name: "CharacterEventWarp",
    code: 11,
  },
  {
    name_ch: "光锥跃迁",
    name: "LightConeEventWarp",
    code: 12,
  },
];
class Param {
  constructor(gacha_type) {
    this.gacha_type = gacha_type === null ? 1 : gacha_type;
    this._page = 1;
    this._size = 20;
    this.end_id = 0;
  }
  toString() {
    return `&gacha_type=${this.gacha_type}&page=${this._page}&size=${this._size}&end_id=${this.end_id}`;
  }
}

/**
 * get and save record of base url and param into json buffer and save to file in json path
 * @param {string}base_url base url of gacha
 * @param {Param}param
 * @param {json}json_buffer
 * @param {string}json_path
 * @param {string} gacha_name
 * @returns {Promise<void>}
 */
async function getAndSaveRecord(
  base_url,
  param,
  json_buffer,
  json_path,
  gacha_name
) {
  const { data } = await axios.get(base_url + param.toString());
  if (data.data === null) throw "用户信息过期";
  const { list } = data.data;
  let last_id = 0;
  for (const record of list) {
    last_id = Number(record.id);
    json_buffer[record.id] = record;
  }
  fs.writeFileSync(json_path, JSON.stringify(json_buffer), {
    encoding: "utf-8",
  });
  ElMessage(`获取到 ${gacha_name} 第${param._page}页`);
  param._page++;
  param.end_id = last_id;
  await sleep(1500);
  if (list.length < 20) return;
  await getAndSaveRecord(base_url, param, json_buffer, json_path, gacha_name);
}
export async function saveAll() {
  const baseUrl = getGachaBaseUrl();
  if (baseUrl === null) {
    ElMessage.error("无法获取查询网址");
    return;
  }
  for (const { code, name_ch } of GachaTypes) {
    const param = new Param(code);
    const { data } = await axios.get(baseUrl + new Param(1).toString());
    if (data.data === null) {
      ElMessage.error("用户信息过期");
      return;
    }
    const { list } = data.data;
    if (list.length === 0) {
      continue;
    }
    const uid = list[0].uid.toString();
    const dir_path = path.join("data", "account", uid);
    fs.mkdirSync(dir_path, { recursive: true });
    let json_buffer = {};
    const json_path = path.join(dir_path, code.toString() + ".json");
    try {
      fs.accessSync(json_path, fs.constants.R_OK | fs.constants.W_OK);
      const json_string = fs.readFileSync(json_path, { encoding: "utf-8" });
      if (json_string !== "") json_buffer = JSON.parse(json_string);
    } catch (err) {
      fs.writeFileSync(json_path, "", { encoding: "utf-8" });
    }
    await sleep(1500);
    await getAndSaveRecord(baseUrl, param, json_buffer, json_path, name_ch);
  }
}
