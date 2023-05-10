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
          <el-col :span="7">
            <el-text>
              <strong>总数：</strong>{{ recordset.statistic["all"] }}
            </el-text>
            <br />
            <el-text>
              <strong>保底内：</strong> {{ recordset.data["bd"] }}
            </el-text>
          </el-col>
          <el-col :span="7">
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
          <el-col :span="10">
            <el-text>
              <strong>五星记录：</strong>
              <el-text
                style="color: orange"
                v-for="role in recordset.data"
                :key="role.name"
              >
                {{ role.name }}[{{ role.num }}]
              </el-text>
            </el-text>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </el-main>
</template>

<script>
import { GachaTypes, saveAll } from "@/utils/gachautils";
import { ElMessage } from "element-plus";
import path from "path";
import fs from "fs";

export default {
  name: "GambleView",
  data() {
    return {
      uid: "",
      uids: [],
      gacha_data: [],
    };
  },
  created() {
    this.showAll();
  },
  methods: {
    saveAll() {
      saveAll().then(() => {
        ElMessage({ message: "成功获取所有信息", type: "success" });
        this.showAll();
      });
    },
    findUids() {
      const data_dir = path.join("data", "account");
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
      console.log(this.uid);
      const dir = path.join("data", "account", this.uid);
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
            data: gdata,
            statistic: statistic,
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
