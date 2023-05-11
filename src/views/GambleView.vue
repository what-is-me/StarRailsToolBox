<template>
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
      <el-card v-for="recordset in gacha_data" :key="recordset.name">
        <template #header>
          <div>
            <span>{{ recordset.name }}</span>
          </div>
        </template>
        <el-row>
          <el-col :span="4">
            <el-text>
              <strong>总数：</strong>{{ recordset.statistic["all"] }}
            </el-text>
            <br />
            <el-text>
              <strong>保底内：</strong> {{ recordset.roles["bd"] }}
            </el-text>
          </el-col>
          <el-col :span="4">
            <el-text style="color: orange">
              <strong>五星：</strong>{{ recordset.statistic["5s"] }}[{{
                (
                  (recordset.statistic["5s"] / recordset.statistic["all"]) *
                  100
                ).toFixed(2)
              }}%]
            </el-text>
            <br />
            <el-text style="color: darkviolet">
              <strong>四星：</strong>{{ recordset.statistic["4s"] }}[{{
                (
                  (recordset.statistic["4s"] / recordset.statistic["all"]) *
                  100
                ).toFixed(2)
              }}%]
            </el-text>
            <br />
            <el-text type="primary">
              <strong>三星：</strong>{{ recordset.statistic["3s"] }}[{{
                (
                  (recordset.statistic["3s"] / recordset.statistic["all"]) *
                  100
                ).toFixed(2)
              }}%]
            </el-text>
          </el-col>
          <el-col :span="12">
            <el-text>
              <strong>五星记录：</strong>
              <el-text
                style="color: orange"
                v-for="role in recordset.roles"
                :key="role.name"
              >
                <el-text v-if="role.num <= 10" style="color: red">
                  {{ role.name }}[{{ role.num }}]
                </el-text>
                <el-text v-else-if="role.num <= 80" style="color: orange">
                  {{ role.name }}[{{ role.num }}]
                </el-text>
                <el-text v-else style="color: gray">
                  {{ role.name }}[{{ role.num }}]
                </el-text>
              </el-text>
            </el-text>
          </el-col>
          <el-col :span="4">
            <el-button
              :icon="More"
              circle
              @click="showTable(recordset.name, recordset.data)"
            />
          </el-col>
        </el-row>
      </el-card>
    </div>
  </el-main>
  <el-drawer
    v-model="tableVisible"
    :title="tableTitle"
    direction="rtl"
    size="50%"
  >
    <el-table
      :data="records"
      style="width: 100%"
      :default-sort="{ prop: 'index', order: 'descending' }"
    >
      <el-table-column type="index" :index="index" width="100" sortable />
      <el-table-column prop="time" label="时间" width="180" />
      <el-table-column label="名称" width="180">
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
import { More } from "@element-plus/icons-vue";

export default {
  name: "GambleView",
  computed: {
    More() {
      return More;
    },
  },
  data() {
    return {
      tableTitle: "",
      tableVisible: false,
      uid: "",
      uids: [],
      gacha_data: [],
      records: [],
    };
  },
  created() {
    this.showAll();
  },
  methods: {
    showTable(tableTitle, records) {
      this.tableTitle = tableTitle;
      this.records = records;
      this.tableVisible = true;
      //console.log(this.records);
    },
    saveAll() {
      saveAll().then(() => {
        ElMessage({ message: "成功获取所有信息", type: "success" });
        this.showAll();
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
    showAll() {
      this.gacha_data = [];
      this.findUids();
      //console.log(this.uid);
      const dir = path.join(ACCOUNT_DIR, this.uid);
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
            tmp++;
            statistic[record.rank_type + "s"]++;
            statistic["all"]++;
            if (record.rank_type === "5") {
              gdata.push({
                num: tmp,
                name: record.name,
              });
              tmp = 0;
            }
          }
          gdata["bd"] = tmp;
          this.gacha_data.push({
            name: gacha_type.name_ch,
            roles: gdata,
            statistic: statistic,
            data: records,
          });
        } catch (e) {
          console.error(e);
        }
      }
    },
  },
};
</script>

<style scoped></style>
