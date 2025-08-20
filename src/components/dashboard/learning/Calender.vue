<script lang="ts">
export default {
  data() {
    return {
      days: ["S", "M", "T", "W", "T", "F", "S"],
      dates: [21, 22, 23, 24, 25, 26, 27],
    };
  },
};
</script>
<template>
  <v-container>
    <v-card class="bg-primary-subtle">
      <v-container>
        <v-row justify="space-between" no-gutters>
          <v-col cols="auto">
            <v-btn size="small" color="secondary" min-width="20">
              <i class="ph ph-caret-left"></i>
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <div class="text-subtitle-1 font-weight-bold">December - 2023</div>
          </v-col>
          <v-col class="text-right" cols="auto">
            <v-btn size="small" color="secondary" min-width="20">
              <i class="ph ph-caret-right"></i>
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols
            v-for="day in days"
            :key="day"
            class="font-weight-bold learning-calender-day"
          >
            {{ day }}
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols
            v-for="(date, index) in dates"
            :key="date"
            class="font-weight-medium learning-calender-date"
            :class="index === 0 ? 'ps-2' : ''"
          >
            <span v-if="date === 21" class="bg-primary rounded-xl pa-2">
              {{ date }}
            </span>
            <span v-else>
              {{ date }}
            </span>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>
