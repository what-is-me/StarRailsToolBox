<template>
  <el-tooltip
    effect="light"
    :content="type + ': ' + name"
    placement="bottom-end"
  >
    <el-badge v-if="num > 0" :value="num" type="info">
      <el-avatar :src="icon" shape="square" :size="size" />
    </el-badge>
    <el-avatar v-else :src="icon" shape="square" :size="size" />
  </el-tooltip>
</template>

<script>
import { itemPic } from "@/utils/wiki";

export default {
  name: "GoldenCard",
  props: {
    num: Number,
    name: String,
    type: String,
    size: String,
  },
  data() {
    return { icon: "" };
  },
  created() {
    this.icon = itemPic(this.type, this.name);
  },
};
</script>

<style scoped></style>
