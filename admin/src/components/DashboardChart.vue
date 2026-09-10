<template>
  <v-chart class="chart" :option="option" :autoresize="true" />
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
.chart {
  height: 320px;
  width: 100%;
}
</style>