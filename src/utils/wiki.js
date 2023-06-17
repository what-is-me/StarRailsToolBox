import axios from "axios";
import { PROGRAM_DATA_DIR } from "@/utils/path_config";
import fs from "fs";
import path from "path";

var wiki = [];
const wiki_url =
  "https://api-static.mihoyo.com/common/blackboard/sr_wiki/v1/home/content/list?app_sn=sr_wiki&channel_id=17";

/**
 * 获取米游社wiki
 * @returns {Promise<void>}
 */
export async function updateWiki() {
  try {
    const { data } = await axios.get(wiki_url, {
      timeout: 5000,
    });
    const wiki_list = data.data.list[0].children;
    for (const { name, list } of wiki_list) {
      const dict = [];
      for (const { title, icon } of list) {
        dict[title] = icon;
      }
      wiki[name] = dict;
    }
    fs.writeFileSync(
      path.join(PROGRAM_DATA_DIR, "wiki.json"),
      JSON.stringify(wiki),
      {
        encoding: "utf-8",
      }
    );
  } catch (err) {
    console.error(err);
    try {
      const wiki_json = fs.readFileSync(
        path.join(PROGRAM_DATA_DIR, "wiki.json"),
        {
          encoding: "utf-8",
        }
      );
      if (wiki_json !== "") wiki = JSON.parse(wiki_json);
    } catch (err) {
      console.error(err);
    }
  }
  //console.log(wiki);
}

/**
 * 按照名字获取图片url
 * @param {string}type 项目种类{角色|光锥|敌对物种|遗器|养成材料|消耗品|模拟宇宙|任务|阅读物|任务道具|贵重物|忘却之庭|其他材料|商店|委托}
 * @param {string}name 项目名
 */
export function itemPic(type, name) {
  const dict = wiki[type];
  if (dict === undefined || dict === null) return null;
  const ret = dict[name];
  if (ret === undefined) return null;
  return ret;
}
