<script lang="ts" setup>
import {
  symbolCounter,
  iconCounter,
} from "@/components/customUI/counter/utils";
</script>
<template>
  <Card title="Basic">
    <v-card-text>
      <div class="text-muted">Use basic counters to show custom details.</div>
      <v-row>
        <v-col
          cols="12"
          sm="6"
          lg="3"
          v-for="i in 4"
          :key="i"
          class="mt-4 text-center"
        >
          <CountTo
            :startVal="0"
            :duration="3000"
            :endVal="25500"
            class="text-h6 font-wight-bold"
          />
          <div class="text-subtitle-2 text-muted mt-3">
            Happy Users & Counting
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
  <Card title="Counter with Symbols" class="mt-4">
    <v-card-text>
      <div class="text-muted">
        Use symbol with counter to show earning like data.
      </div>
      <v-row>
        <v-col
          cols="12"
          sm="6"
          lg="3"
          v-for="(item, index) in symbolCounter"
          :key="index"
          class="mt-4 text-center"
        >
          <CountTo
            :startVal="0"
            :duration="3000"
            :prefix="item.prefix"
            :suffix="item.suffix"
            :decimals="item.decimals"
            :endVal="item.value"
            class="text-h6 font-wight-bold"
          />
          <div class="text-subtitle-2 text-muted mt-3">
            {{ item.title }}
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
  <Card title="Counter with Icons" class="mt-4">
    <v-card-text>
      <div class="text-muted">
        Use icon counter to show your number of Happy clients, Downloads etc
        data.
      </div>
      <v-row justify="space-around">
        <v-col
          cols="12"
          sm="6"
          lg="auto"
          v-for="(item, index) in iconCounter"
          :key="index"
          class="mt-4 text-center"
        >
          <div class="mb-3">
            <v-avatar :color="item.color" variant="tonal" size="50">
              <i :class="item.icon" class="ph-2x" />
            </v-avatar>
          </div>
          <CountTo
            :startVal="0"
            :duration="3000"
            :suffix="item.suffix"
            :endVal="item.value"
            class="text-h6 font-wight-bold"
          />
          <div class="text-subtitle-2 text-muted mt-3">
            {{ item.title }}
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
