<script lang="ts" setup>
import { schedule } from "@/components/learning/students/courses/utils";
import { useRouter } from "vue-router";
import { Avatar1 } from "@/assets/images/users/utils";
import { ref } from "vue";

const router = useRouter();
const date = ref(new Date());
const onClick = () => {
  router.push({ path: "/learning/overview" });
};
</script>
<template>
  <v-card>
    <div class="text-center">
      <v-avatar size="70" class="mt-5">
        <v-img :src="Avatar1" />
      </v-avatar>
      <div class="text-subtitle-1 font-weight-bold mt-2">Josefa Weissna</div>
      <div class="text-muted mt-1">Student</div>
    </div>
    <v-card-text>
      <VueDatePicker
        :inline="true"
        v-model="date"
        :teleport="true"
        class="d-block"
        :enable-time-picker="false"
        :action-row="{
          showSelect: false,
          showCancel: false,
          showNow: false,
          showPreview: false,
        }"
      />
    </v-card-text>
  </v-card>
  <div class="mt-5">
    <div class="text-subtitle-1 font-weight-bold">Courses Schedule</div>
    <v-card
      class="mt-4"
      elevation="0"
      v-for="(item, index) in schedule"
      :key="'schedule-' + index"
      @click="onClick"
    >
      <v-card-text class="d-flex justify-space-between">
        <div class="d-flex">
          <div class="text-muted text-center">
            <div>{{ item.date }}</div>
            <div class="font-weight-bold">{{ item.month }}</div>
          </div>
          <v-divider vertical class="mx-4" />
          <div>
            <div class="font-weight-bold mb-1">{{ item.title }}</div>
            <div class="text-muted">
              <b> {{ item.currentCount }} </b>
              of
              {{ item.total }} Lessons
            </div>
          </div>
        </div>
        <div class="text-muted">{{ item.time }}</div>
      </v-card-text>
    </v-card>
  </div>
</template>
