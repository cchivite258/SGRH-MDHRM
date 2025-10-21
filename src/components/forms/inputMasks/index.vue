<script lang="ts" setup>
import { ref } from "vue";

const val1 = ref("");
const val1Option = { mask: "#.## cm" };

const val2 = ref("");
const val2Option = { mask: "+1 (###) ###-####" };

const val3 = ref("");
const val3Option = { mask: "#### #### #### ####" };

const val4 = ref("");
const val4Option = { mask: "##/##/####" };

const val5 = ref("");
const val5Option = { mask: "###.###.###.###" };

const val6 = ref("");
const val6Option = { mask: "###.###.###-##" };
</script>
<template>
  <Card title="Examples">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">Dynamic mask</div>
          <v-text-field
            v-model="val1"
            hide-details
            variant="outlined"
            density="compact"
            v-maska:[val1Option]
          />
          <div class="text-muted">e.g. #.## cm</div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">Phone with code</div>
          <v-text-field
            v-model="val2"
            hide-details
            variant="outlined"
            density="compact"
            v-maska:[val2Option]
          />
          <div class="text-muted">e.g. +1 (###) ###-####</div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">Credit card</div>
          <v-text-field
            v-model="val3"
            hide-details
            variant="outlined"
            density="compact"
            v-maska:[val3Option]
          />
          <div class="text-muted">e.g. #### #### #### ####</div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">Date</div>
          <v-text-field
            v-model="val4"
            hide-details
            variant="outlined"
            density="compact"
            v-maska:[val4Option]
          />
          <div class="text-muted">e.g. ##/##/####</div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">IP Address</div>
          <v-text-field
            v-model="val5"
            hide-details
            variant="outlined"
            density="compact"
            v-maska:[val5Option]
          />
          <div class="text-muted">e.g xxx.xxx.xxx.xxx</div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">CPF/CNPJ</div>
          <v-text-field
            v-model="val6"
            hide-details
            variant="outlined"
            density="compact"
            v-maska:[val6Option]
          />
          <div class="text-muted">e.g. ###.###.###-##</div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
