import { loadSetting, saveSetting } from "@/utils/settingutils";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
import { ElMessage } from "element-plus";
import { ACCOUNT_DIR, WEB_CACHE_PATH } from "@/utils/path_config";
const sleep = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

/**
 * 清理部分param
 * @param {string}gachaUrl
 * @returns {string}
 */
export function cleanGacha(gachaUrl) {
  gachaUrl = gachaUrl.replaceAll(/&gacha_type=\d+/g, "");
  gachaUrl = gachaUrl.replaceAll(/&page=\d+/g, "");
  gachaUrl = gachaUrl.replaceAll(/&size=\d+/g, "");
  gachaUrl = gachaUrl.replaceAll(/&end_id=\d+/g, "");
  return gachaUrl;
}

/**
 * 获取查询抽卡记录的url，并删除其中的gacha_type,page,size,end_id参数
 * @returns {string|null} base url of gacha, null if not find
 */
export function getGachaUrl() {
  const game_path = loadSetting().game_path;
  const web_cache_path = path.join(game_path, WEB_CACHE_PATH);
  console.log(web_cache_path);
  try {
    const web_cache = fs.readFileSync(web_cache_path, { encoding: "utf-8" });
    //console.log(web_cache);
    const gachaUrls = [...web_cache.matchAll("https://api[!-z]+")];
    //console.log(gachaUrls);
    if (gachaUrls.length === 0) return null;
    let gachaUrl = gachaUrls[gachaUrls.length - 1][0];
    return gachaUrl;
  } catch (err) {
    throw "读取缓存失败";
  }
}

export const GachaTypes = [
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
 * 获取某页和之后的抽卡记录（如你所见，是个递归），并保存（怕获取失败前面的白跑了）
 * @param {string}base_url
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
  if (data.data === null) {
    //const web_cache_path = path.join(loadSetting().game_path, WEB_CACHE_PATH);
    //fs.rm(web_cache_path, () => {});
    throw "用户信息过期<br>请尝试打开游戏并查询一两次抽卡记录";
  }
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

/**
 * 获取并保存所有抽卡记录
 * @returns {Promise<void>}
 */
export async function saveAll() {
  const setting = loadSetting();
  let baseUrl = null;
  try {
    if (setting.gacha_url === null || setting.gacha_url === "") {
      throw new Error("gacha_url is empty");
    }
    baseUrl = cleanGacha(setting.gacha_url);
    const { data } = await axios.get(baseUrl + new Param(1).toString());
    if (data.data === null) {
      console.log("缓存的抽卡网址已过期");
      throw new Error("gacha_url out of date");
    }
  } catch (e) {
    baseUrl = getGachaUrl();
    console.log(baseUrl);
    setting.gacha_url = baseUrl;
    baseUrl = cleanGacha(baseUrl);
    saveSetting(setting);
  }

  if (baseUrl === null) {
    return new Promise(function (resolve, reject) {
      reject("无法获取查询网址");
    });
  }
  for (const { code, name_ch } of GachaTypes) {
    const param = new Param(code);
    const { data } = await axios.get(baseUrl + new Param(1).toString());
    if (data.data === null) {
      return new Promise(function (resolve, reject) {
        reject("用户信息过期");
      });
    }
    const { list } = data.data;
    if (list.length === 0) {
      continue;
    }
    const uid = list[0].uid.toString();
    const dir_path = path.join(ACCOUNT_DIR, uid);
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
