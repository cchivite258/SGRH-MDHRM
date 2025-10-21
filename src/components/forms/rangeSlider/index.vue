<script lang="ts" setup>
import { colors } from "@/components/ui/utils";

import { ref } from "vue";
const minMax = ref([-5, 5]);
</script>
<template>
  <div class="text-muted mb-4">
    The <code>v-range-slider</code> are used when there is need of representing
    a range of values.
  </div>

  <Card title="Sliders">
    <v-card-text>
      <div class="text-subtitle-2 font-weight-bold mb-2">Default Range</div>
      <v-range-slider />

      <div class="text-subtitle-2 font-weight-bold mb-2">Strict Range</div>
      <div class="text-muted">
        With the <code>strict</code> prop applied, the thumbs of the range
        slider are not allowed to cross over each other.
      </div>
      <v-range-slider strict :model-value="[20, 40]" />

      <div class="text-subtitle-2 font-weight-bold mb-2">Disabled</div>
      <div class="text-muted">
        You cannot interact with <code>disabled</code> sliders.
      </div>
      <v-range-slider disabled :model-value="[20, 40]" />

      <div class="text-subtitle-2 font-weight-bold mb-2">Min and Max</div>
      <div class="text-muted">
        You can set <code>min</code> and <code>max</code> values of sliders.
      </div>
      <div class="d-flex align-center">
        <span class="border pa-3 rounded"> {{ minMax[0] }} </span>
        <v-range-slider
          v-model="minMax"
          :max="10"
          :min="-10"
          :step="1"
          hide-details
        />
        <span class="border pa-3 rounded"> {{ minMax[1] }} </span>
      </div>
      <div class="text-subtitle-2 font-weight-bold mb-2 mt-4">
        Slider with label
      </div>
      <v-range-slider :model-value="[20, 40]" step="1" thumb-label="always" />
      <div class="text-subtitle-2 font-weight-bold mb-2 mt-4">
        vertical slider
      </div>
      <div class="text-muted">Use <code>direction="vertical"</code> prop.</div>
      <v-range-slider :model-value="[20, 40]" step="1" direction="vertical" />

      <div class="text-subtitle-2 font-weight-bold mb-2 mt-4">
        Slider with colors
      </div>
      <v-row>
        <v-col cols="12" lg="6" v-for="item in colors" :key="item.value">
          <div class="text-muted font-weight-bold">{{ item.text }} slider</div>
          <v-range-slider
            :model-value="[20, 40]"
            step="1"
            :color="item.value"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
