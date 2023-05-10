<template>
  <el-container>
    <el-aside>
      <el-menu :default-active="activeIndex" class="el-menu-demo">
        <el-menu-item
          v-for="item in rt"
          :key="item.index"
          :index="item.index"
          @click="handleSelect(item.path, item.index)"
        >
          {{ item.name }}
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <router-view> </router-view>
    </el-main>
  </el-container>
</template>

<style></style>
<script>
import { routes } from "@/router";

export default {
  name: "App",
  data() {
    return {
      activeIndex: "",
      rt: [
        {
          path: "/",
          name: "主页",
          index: "1",
        },
      ],
    };
  },
  created() {
    this.rt = routes;
  },
  methods: {
    handleSelect(path, index) {
      this.activeIndex = index;
      this.$router.push(path);
      //console.log(path, this.activeIndex);
    },
  },
};
</script>
