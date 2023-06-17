<template>
  <el-header style="text-align: center">
    <h1>设置</h1>
  </el-header>
  <el-main>
    <el-form-item label="游戏路径： ">
      <el-input v-model="game_path" />
    </el-form-item>
    <el-form-item label="查询路径： ">
      <el-input v-model="gacha_url" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="reloadSetting">取消</el-button>
    </el-form-item>
  </el-main>
</template>
<script>
import { loadSetting, saveSetting, Setting } from "@/utils/settingutils";
import { cleanGacha } from "@/utils/gachautils";

export default {
  name: "SettingView",
  data() {
    return {
      game_path: "",
      gacha_url: "",
    };
  },
  created() {
    this.reloadSetting();
  },
  methods: {
    save() {
      const setting = new Setting();
      setting.game_path = this.game_path;
      setting.gacha_url = cleanGacha(this.gacha_url);
      saveSetting(setting);
    },
    reloadSetting() {
      const setting = loadSetting();
      this.game_path = setting.game_path ? setting.game_path : "";
      this.gacha_url = setting.gacha_url ? setting.gacha_url : "";
    },
  },
};
</script>
