<template>
  <!--页头-->
  <el-header>
    <el-row>
      <el-col :span="8">
        <el-form-item label="用户uid：">
          <el-select
            v-model="uid"
            class="m-2"
            placeholder="uid"
            @change="showAll"
          >
            <el-option
              v-for="item in uids"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="4" :offset="12">
        <el-button @click="saveAll()">获取抽卡记录</el-button>
      </el-col>
    </el-row>
  </el-header>
  <el-main>
    <div v-if="gacha_data.length > 0">
      <!--四种跃迁-->
      <el-tabs type="border-card">
        <el-tab-pane
          v-for="recordset in gacha_data"
          :key="recordset.name"
          :label="recordset.name"
        >
          <el-row>
            <el-col :span="8">
              <el-text>
                <strong>总数：</strong>&ensp;&ensp;{{
                  recordset.statistic["all"]
                }}
              </el-text>
              <br />
              <el-text>
                <strong>保底内：</strong> {{ recordset.roles["bd"] }}发
              </el-text>
              <br />
              <el-text style="color: orange">
                <strong>五星：</strong>&ensp;&ensp;{{
                  recordset.statistic["5s"]
                }}[{{
                  (
                    (recordset.statistic["5s"] / recordset.statistic["all"]) *
                    100
                  ).toFixed(2)
                }}%]
              </el-text>
              <br />
              <el-text style="color: darkviolet">
                <strong>四星：</strong>&ensp;&ensp;{{
                  recordset.statistic["4s"]
                }}[{{
                  (
                    (recordset.statistic["4s"] / recordset.statistic["all"]) *
                    100
                  ).toFixed(2)
                }}%]
              </el-text>
              <br />
              <el-text type="primary">
                <strong>三星：</strong>&ensp;&ensp;{{
                  recordset.statistic["3s"]
                }}[{{
                  (
                    (recordset.statistic["3s"] / recordset.statistic["all"]) *
                    100
                  ).toFixed(2)
                }}%]
              </el-text>
              <br />
              <br />
              <el-link @click="showTable(recordset.name, recordset.data)">
                抽卡详情
              </el-link>
            </el-col>
            <el-col :span="16">
              <el-scrollbar max-height="300px">
                <golden-card-large
                  v-for="role in recordset.roles"
                  :key="role.id"
                  :type="role.type"
                  :name="role.name"
                  :num="role.num"
                />
              </el-scrollbar>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
      <!--角色和光锥一览-->
      <el-tabs type="border-card">
        <el-tab-pane label="角色总览">
          <el-space wrap size="large">
            <golden-card
              v-for="{ name, num, id } in characters"
              :key="id"
              :num="num"
              type="角色"
              :name="name"
              size="large"
            />
          </el-space>
        </el-tab-pane>
        <el-tab-pane label="光锥总览">
          <el-space wrap size="large">
            <golden-card
              v-for="{ name, num, id } in lightcones"
              :key="id"
              :num="num"
              type="光锥"
              :name="name"
              size="large"
            />
          </el-space>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-main>
  <!--详细表格-->
  <el-drawer
    v-model="tableVisible"
    :title="tableTitle"
    direction="rtl"
    size="45%"
  >
    <el-table
      :data="records"
      style="width: 100%"
      :default-sort="{ prop: 'index', order: 'descending' }"
    >
      <el-table-column
        type="index"
        :index="1"
        label="No."
        width="100"
        sortable
      />
      <el-table-column prop="time" align="center" label="时间" width="180" />
      <el-table-column label="名称" align="center" width="200">
        <template #default="scope">
          <el-text v-if="scope.row.rank_type === '5'" style="color: orange">
            {{ scope.row.name }}
          </el-text>
          <el-text
            v-else-if="scope.row.rank_type === '4'"
            style="color: darkviolet"
          >
            {{ scope.row.name }}
          </el-text>
          <el-text v-else type="primary">
            {{ scope.row.name }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="item_type" label="种类" width="80" />
    </el-table>
  </el-drawer>
</template>

<script>
import { GachaTypes, saveAll } from "@/utils/gachautils";
import { ElMessage } from "element-plus";
import path from "path";
import fs from "fs";
import { ACCOUNT_DIR } from "@/utils/path_config";
import { updateWiki } from "@/utils/wiki";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import GoldenCard from "@/components/GoldenCard.vue";
import GoldenCardLarge from "@/components/GoldenCardLarge.vue";

ChartJS.register(ArcElement, Tooltip, Legend);
export default {
  name: "GambleView",
  components: { GoldenCardLarge, GoldenCard },
  data() {
    return {
      tableTitle: "",
      tableVisible: false,
      uid: "",
      uids: [],
      gacha_data: [],
      records: [],
      characters: [],
      lightcones: [],
    };
  },
  created() {
    updateWiki().then(() => {
      this.showAll();
    });
  },
  methods: {
    showTable(tableTitle, records) {
      this.tableTitle = tableTitle;
      this.records = records;
      this.tableVisible = true;
    },
    saveAll() {
      saveAll()
        .then(() => {
          ElMessage({ message: "成功获取所有信息", type: "success" });
          this.showAll();
        })
        .catch((err) => {
          ElMessage.error(err);
        });
    },
    findUids() {
      const data_dir = ACCOUNT_DIR;
      try {
        fs.accessSync(data_dir);
        this.uids = fs.readdirSync(data_dir);
        if (this.uid === "" && this.uids.length > 0) this.uid = this.uids[0];
        // eslint-disable-next-line no-empty
      } catch (e) {}
    },
    /**
     * 正在变成屎山QAQ
     */
    showAll() {
      const gacha_data = [];
      this.findUids();
      const dir = path.join(ACCOUNT_DIR, this.uid);
      const characters = [];
      const lightcones = [];
      const rank_map = [];
      for (const gacha_type of GachaTypes) {
        try {
          const json_path = path.join(
            dir,
            gacha_type.code.toString() + ".json"
          );
          const records = Object.values(
            JSON.parse(fs.readFileSync(json_path, { encoding: "utf-8" }))
          );
          records.sort(function (a, b) {
            return Number(a.id) - Number(b.id);
          });
          const gdata = [];
          const statistic = [];
          statistic["3s"] = 0;
          statistic["4s"] = 0;
          statistic["5s"] = 0;
          statistic["all"] = 0;
          let tmp = 0;
          for (const record of records) {
            rank_map[record.name] = Number(record.rank_type);
            tmp++;
            statistic[record.rank_type + "s"]++;
            statistic["all"]++;
            if (record.rank_type === "5") {
              gdata.push({
                num: tmp,
                name: record.name,
                type: record.item_type,
                id: record.id,
              });
              tmp = 0;
            }
            if (record["item_type"] === "光锥") {
              lightcones[record.name] =
                lightcones[record.name] === undefined
                  ? 1
                  : lightcones[record.name] + 1;
            }
            if (record["item_type"] === "角色") {
              characters[record.name] =
                characters[record.name] === undefined
                  ? 1
                  : characters[record.name] + 1;
            }
          }
          gdata["bd"] = tmp;
          gacha_data.push({
            name: gacha_type.name_ch,
            roles: gdata.reverse(),
            statistic: statistic,
            data: records,
          });
        } catch (e) {
          console.error(e);
        }
      }
      this.gacha_data = gacha_data;
      const temp_characters = [];
      for (const name in characters) {
        //console.log(name, itemPic("角色", name));
        temp_characters.push({
          name: name,
          num: characters[name],
          rank: rank_map[name],
          id: 0,
        });
      }
      temp_characters.sort((a, b) => {
        return b.rank - a.rank;
      });
      for (const i in temp_characters) {
        temp_characters[i].id = i;
      }
      this.characters = temp_characters;
      const temp_lightcones = [];
      for (const name in lightcones) {
        temp_lightcones.push({
          name: name,
          num: lightcones[name],
          rank: rank_map[name],
          id: 0,
        });
      }
      temp_lightcones.sort((a, b) => {
        return b.rank - a.rank;
      });
      for (const i in temp_lightcones) {
        temp_lightcones[i].id = i;
      }
      this.lightcones = temp_lightcones;
    },
  },
};
</script>

<style scoped>
.el-statistic {
  margin: 16px 8px;
  text-align: center;
}
</style>
