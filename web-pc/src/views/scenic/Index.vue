<template>
  <div class="scenic-page">
    <div class="container">
      <h1 class="page-title">景点推荐</h1>
      <div class="scenic-list">
        <div v-for="scenic in scenics" :key="scenic.id" class="scenic-card card">
          <img :src="scenic.cover" :alt="scenic.name" />
          <div class="scenic-info">
            <h3>{{ scenic.name }}</h3>
            <p>{{ scenic.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const scenics = ref([])
</script>
