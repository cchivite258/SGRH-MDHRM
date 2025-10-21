<script lang="ts" setup>
import { computed } from "vue";
const url = computed(() => {
  return "https://www.youtube.com/embed/1y_kfWUCFDQ";
});
</script>
<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Ratio Video 16:9">
        <v-card-text>
          <div class="mb-2">Set <code>:aspect-ratio="16 / 9"</code></div>
          <v-responsive :aspect-ratio="16 / 9">
            <iframe
              class="rounded h-100 w-100"
              :src="url"
              title="YouTube video"
              allowfullscreen
            ></iframe>
          </v-responsive>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Ratio Video 21:9">
        <v-card-text>
          <div class="mb-2">Set <code>:aspect-ratio="21 / 9"</code></div>

          <v-responsive :aspect-ratio="21 / 9">
            <iframe
              class="rounded h-100 w-100"
              :src="url"
              title="YouTube video"
              allowfullscreen
            ></iframe>
          </v-responsive>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Ratio Video 4:3">
        <v-card-text>
          <div class="mb-2">Set <code>:aspect-ratio="4 / 3"</code></div>

          <v-responsive :aspect-ratio="4 / 3">
            <iframe
              class="rounded h-100 w-100"
              :src="url"
              title="YouTube video"
              allowfullscreen
            ></iframe>
          </v-responsive>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Ratio Video 1:1">
        <v-card-text>
          <div class="mb-2">Set <code>:aspect-ratio="1 / 1"</code></div>

          <v-responsive :aspect-ratio="1 / 1">
            <iframe
              class="rounded h-100 w-100"
              :src="url"
              title="YouTube video"
              allowfullscreen
            ></iframe>
          </v-responsive>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Custom Ratios">
        <v-card-text>
          <v-responsive>
            <iframe
              class="rounded h-100 w-100"
              :src="url"
              title="YouTube video"
              allowfullscreen
            ></iframe>
          </v-responsive>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
