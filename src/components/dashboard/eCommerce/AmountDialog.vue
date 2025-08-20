<script lang="ts">
export default {
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      cardTypes: ["Visa", "Mastercard", "Credit Card"],
    };
  },
  computed: {
    dialogValue: {
      get() {
        return this.$props.dialog;
      },
      set(newVal: Boolean) {
        this.$emit("onDialogValueChange", newVal);
      },
    },
  },
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="550" scrollable>
    <v-card style="overflow: hidden">
      <v-card-title class="d-flex justify-space-between align-center">
        <h4 class="text-subtitle-1 font-weight-bold">Add Amount</h4>
        <v-btn icon @click="dialogValue = false">
          <i class="ph-x ph-lg"></i>
        </v-btn>
      </v-card-title>
      <v-card-text style="overflow-y: auto" class="pt-0">
        <h5 class="font-weight-bold text-subtitle-2 pb-2">Amount</h5>
        <TextField color="primary" placeholder="$0000.00" type="number" />

        <h5 class="font-weight-bold text-subtitle-2 pb-2">Select Method</h5>
        <v-radio-group inline class="form-check" color="primary" hide-details>
          <v-container class="px-0 pt-0">
            <v-row no-gutters>
              <v-col
                v-for="(card, index) in cardTypes"
                :key="card"
                class=""
                cols
                md="4"
              >
                <v-radio
                  :label="card"
                  :value="index"
                  :height="35"
                  class="form-check-input amount-dialog-card-type"
                ></v-radio>
              </v-col>
            </v-row>
          </v-container>
        </v-radio-group>
        <h5 class="font-weight-bold text-subtitle-2 pb-2">Card Number</h5>
        <TextField
          color="primary"
          placeholder="xxxx xxxx xxxx xxxx"
          type="number"
        />
        <v-row>
          <v-col cols="12" md="9" class="pt-0 pe-md-0">
            <h5 class="font-weight-bold text-subtitle-2 pb-2">Expiry Date</h5>
            <div class="d-flex flex-wrap flex-md-nowrap">
              <TextField
                color="primary"
                placeholder="MM"
                type="number"
                class="me-md-3 w-100"
              />
              <TextField
                color="primary"
                placeholder="YYYY"
                type="number"
                class="w-100"
              />
            </div>
          </v-col>
          <v-col cols="12" md="3" class="pt-0">
            <h5 class="font-weight-bold text-subtitle-2 pb-2">CVV/CVC</h5>
            <TextField color="primary" placeholder="****" type="number"
          /></v-col>
        </v-row>
        <h5 class="font-weight-bold text-subtitle-2 pb-2">Cardholders Name</h5>
        <TextField
          color="primary"
          placeholder="Enter name"
          hide-details="auto"
        />
      </v-card-text>
      <v-card-actions>
        <v-row class="justify-end">
          <v-col class="text-right">
            <v-btn class="text-danger" @click="dialogValue = false">
              <i class="ph-x"></i> Close
            </v-btn>
            <v-btn
              variant="elevated"
              color="primary"
              @click="dialogValue = false"
            >
              Add Amount
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
