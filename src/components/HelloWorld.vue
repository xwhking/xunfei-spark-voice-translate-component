<script setup>
import { ref } from 'vue'
import {defineProps} from "vue";
const count = ref(0)
import VoiceTranslate from './VoiceTranslate.vue'
defineProps(['msg'])
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <br>
    <voice-translate></voice-translate>
    <p>
      <code><a href="https://github.com/xwhking" target="_blank">Github</a></code> to star the project and follow me
    </p>
    <p>
      <code><a href="https://blog.csdn.net/Go_ahead_forever" target="_blank">CSDN</a></code> to follow me and Know more about me
    </p>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
