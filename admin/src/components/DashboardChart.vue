<template>
  <div class="chart-wrap">
    <v-chart class="chart" :option="option" :autoresize="true" />
  </div>
</template>

<script setup lang="ts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, GridComponent, TitleComponent } from 'echarts/components';
import VChart from 'vue-echarts';

use([CanvasRenderer, LineChart, BarChart, PieChart, TooltipComponent, LegendComponent, GridComponent, TitleComponent]);

defineProps<{ option: any }>();
</script>

<style scoped>
.chart-wrap {
  width: 100%;
  height: 100%;
  min-height: 320px;
}
.chart {
  width: 100%;
  height: 100%;
  min-height: 320px;
}
</style>