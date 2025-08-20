<script lang="ts" setup>
import { formateDate } from "@/app/common/dateFormate";
import { useLayoutStore } from "@/store/app";
import { ref, computed } from "vue";

const state = useLayoutStore();

const isDarkMode = computed(() => state.mode === "dark");
const date1 = ref();
const date2 = ref();
const date3 = ref();
const date4 = ref();
const date5 = ref(new Date());
const date6 = ref();
const date7 = ref();

const time1 = ref();
const time2 = ref();
const time3 = ref();
const time4 = ref({ hours: 3, minutes: 30 });

const color = ref("#000000");
const isColor = ref(false);

const getLastDate = () => {
  const today = new Date();
  const lastDay = new Date(today);
  lastDay.setDate(today.getDate() + 7);

  return lastDay;
};

const format = (date: Date) => {
  return formateDate(date);
};

const disabledDates = computed(() => {
  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const afterTomorrow = new Date(tomorrow);
  afterTomorrow.setDate(tomorrow.getDate() + 1);

  return [tomorrow, afterTomorrow];
});
</script>
<template>
  <Card title="Vue Datepicker">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">Basic</div>
          <div class="text-muted">
            Use <code>VueDatePicker</code> component.
          </div>
          <VueDatePicker v-model="date1" :teleport="true" />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">Disable time selection</div>
          <div class="text-muted">
            Make <code>enable-time-picker: false</code> component.
          </div>
          <VueDatePicker
            v-model="date2"
            :teleport="true"
            :enable-time-picker="false"
          />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">Format date</div>
          <div class="text-muted">
            Add <code>format</code> prop and format date as per the need.
          </div>
          <VueDatePicker
            v-model="date3"
            :teleport="true"
            :enable-time-picker="false"
            :format="format"
          />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">Min and max date</div>
          <div class="text-muted">
            Use <code>min-date</code> and <code>max-date</code> prop.
          </div>
          <VueDatePicker
            v-model="date4"
            :min-date="new Date()"
            :max-date="getLastDate()"
            :teleport="true"
            :enable-time-picker="false"
          />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">Default date</div>
          <div class="text-muted">Set <code>v-model</code> value</div>
          <VueDatePicker
            v-model="date5"
            :min-date="new Date()"
            :max-date="getLastDate()"
            :teleport="true"
            :enable-time-picker="false"
          />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">Disabled date</div>
          <div class="text-muted">Set <code>disabled-dates</code> prop</div>
          <VueDatePicker
            v-model="date6"
            :disabled-dates="disabledDates"
            :teleport="true"
            :enable-time-picker="false"
          />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">Range selector</div>
          <div class="text-muted">Set <code>range</code> prop</div>
          <VueDatePicker range :teleport="true" />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">Month Picker</div>
          <div class="text-muted">Set <code>month-picker</code> prop</div>
          <VueDatePicker v-model="date6" month-picker :teleport="true" />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">Inline Picker</div>
          <div class="text-muted">
            Set <code>:inline="{ input: true }"</code> prop
          </div>
          <VueDatePicker
            :inline="{ input: true }"
            v-model="date7"
            :teleport="true"
            class="d-block"
            :enable-time-picker="false"
            auto-apply
            :dark="isDarkMode"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Vue DatePicker - Time picker" class="mt-4">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">Basic</div>
          <div class="text-muted">Add <code>time-picker</code> prop.</div>
          <VueDatePicker
            v-model="time1"
            auto-apply
            time-picker
            :teleport="true"
          />

          <div class="font-weight-bold mb-1 mt-4">Enable Seconds</div>
          <div class="text-muted">Add <code>enable-seconds</code> prop.</div>
          <VueDatePicker
            v-model="time3"
            auto-apply
            time-picker
            enable-seconds
            :teleport="true"
          />
          <div class="font-weight-bold mb-1 mt-4">Min time</div>
          <div class="text-muted">
            Add <code>min-time, max-time</code> prop.
          </div>
          <VueDatePicker
            v-model="time4"
            auto-apply
            time-picker
            :min-time="{ hours: 3, minutes: 30 }"
            :max-time="{ hours: 10, minutes: 30 }"
            :teleport="true"
          />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-1">Inline</div>
          <div class="text-muted">Add <code>inline</code> prop.</div>
          <VueDatePicker
            v-model="time2"
            is-24
            class="d-block"
            auto-apply
            time-picker
            :teleport="true"
            :inline="true"
            :dark="isDarkMode"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
  <Card title="Color Picker" class="mt-4">
    <v-card-text>
      <div class="text-muted mb-2">
        Use <code>v-color-picker</code> component.
      </div>
      <v-sheet
        :color="color"
        height="50px"
        width="150px"
        rounded
        @click="isColor = !isColor"
      ></v-sheet>
      <v-color-picker v-if="isColor" v-model="color" />
    </v-card-text>
  </Card>
</template>
