<script lang="ts" setup>
import { ref } from "vue";
import NumberSpinner from "@/app/common/components/NumberSpinner.vue";

const val1 = ref();
const input1 = ref(0);
const input2 = ref(0);
const input3 = ref(0);
const input4 = ref(0);
</script>
<template>
  <Card title="Form Input Spin">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="6">
          <div class="text-muted font-weight-bold mb-2">Default</div>
          <NumberSpinner
            v-model="input1"
            @onAdd="input1 < 100 && input1++"
            @onReduce="input1 > 0 && input1--"
          />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="text-muted font-weight-bold mb-2">Default Light</div>
          <NumberSpinner
            class="bg-light"
            v-model="input3"
            @onAdd="input3 < 100 && input3++"
            @onReduce="input3 > 0 && input3--"
          />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="text-muted font-weight-bold mb-2">Full width</div>
          <NumberSpinner
            v-model="input2"
            class="d-flex justify-space-between"
            @onAdd="input2 < 100 && input2++"
            @onReduce="input2 > 0 && input2--"
          />
        </v-col>

        <v-col cols="12" lg="6">
          <div class="text-muted font-weight-bold mb-2">Full width light</div>
          <NumberSpinner
            v-model="input4"
            class="d-flex justify-space-between bg-light"
            @onAdd="input4 < 100 && input4++"
            @onReduce="input4 > 0 && input4--"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card class="mt-4" title="Autocomplete">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="6">
          <div class="text-muted mb-1">Search result of fruit names</div>
          <v-autocomplete
            variant="outlined"
            density="compact"
            placeholder="Search fruit"
            :items="[
              'Ackee',
              'Longan',
              'Lychee',
              'Banana',
              'Mango',
              'Mangosteen',
              'Coconut',
              'Muskmelon',
              'Papaya',
              'Dragon fruit',
              'Passion fruit',
              'Persimmon',
            ]"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="text-muted mb-1">Search result of car names</div>
          <v-autocomplete
            variant="outlined"
            density="compact"
            placeholder="Search car"
            :items="[
              'Mercedes-Benz',
              'Chevy',
              'BMW',
              'Ford',
              'Renault',
              'Ford Mustang',
              'Volkswagen Beetle',
              'Porsche',
              'Mitsubishi Pajero',
            ]"
          ></v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card
    title="Custom Country Select input"
    class="mt-4"
    style="height: 400px !important"
  >
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-4 text-subtitle-2">
            Simple Select Example
          </div>
          <MazPhoneNumberInput
            v-model="val1"
            placeholder="Enter number"
            :showCodeOnList="false"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-4 text-subtitle-2">
            Disabled Phone number input
          </div>
          <MazPhoneNumberInput
            disabled
            placeholder="Enter number"
            :showCodeOnList="false"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
