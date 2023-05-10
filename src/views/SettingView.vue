<template>
  <el-header style="text-align: center">
    <h1>设置</h1>
  </el-header>
  <el-main>
    <el-form-item label="游戏路径： ">
      <el-input v-model="game_path" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="reload">取消</el-button>
    </el-form-item>
  </el-main>
</template>
<script>
import { loadSetting, saveSetting, Setting } from "@/utils/settingutils";

export default {
  name: "SettingView",
  data() {
    return {
      game_path: "",
    };
  },
  created() {
    this.reload();
  },
  methods: {
    save() {
      const setting = new Setting();
      setting.game_path = this.game_path;
      saveSetting(setting);
    },
    reload() {
      const setting = loadSetting();
      this.game_path = setting.game_path;
    },
  },
};
</script>
