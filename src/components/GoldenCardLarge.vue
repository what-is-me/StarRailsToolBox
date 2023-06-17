<template>
  <el-row align="middle">
    <el-col :span="3">
      <golden-card :type="type" :name="name" />
    </el-col>
    <el-col :span="5">
      <el-text>{{ name }}</el-text>
    </el-col>
    <el-col :span="16">
      <el-progress
        :stroke-width="12"
        :percentage="(num / 90) * 100"
        :color="customColors"
      >
        <span>{{ num }}</span>
      </el-progress>
    </el-col>
  </el-row>
</template>

<script>
import GoldenCard from "@/components/GoldenCard.vue";

export default {
  name: "GoldenCardLarge",
  components: { GoldenCard },
  props: {
    type: String,
    name: String,
    num: Number,
  },
  data() {
    return {
      customColors: [
        { color: "#e6a23c", percentage: 22 },
        { color: "#5cb87a", percentage: 50 },
        { color: "#999999", percentage: 89 },
        { color: "#f56c6c", percentage: 100 },
      ],
    };
  },
};
</script>

<style scoped></style>
