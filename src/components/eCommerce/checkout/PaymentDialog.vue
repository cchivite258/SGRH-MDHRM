<script lang="ts" setup>
import { computed, ref } from "vue";

const emit = defineEmits(["update:modelValue", "onConfirm"]);
const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const form = ref({
  cardNum: "",
  cardHolder: "",
  expiry: "",
  cvc: "",
});

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});
</script>
<template>
  <v-dialog v-model="dialogValue" width="450">
    <Card title="Add Card" title-class="py-0">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-card-text>
        <h5 class="text-subtitle-2 pb-2">Card Number</h5>
        <TextField v-model="form.cardNum" placeholder="Card Number" type="number" />

        <h5 class="text-subtitle-2 pb-2">Card holder</h5>
        <TextField v-model="form.cardHolder" placeholder="Full name" />

        <v-row>
          <v-col cols="12" lg="6">
            <h5 class="text-subtitle-2 pb-2">Expiry</h5>
            <TextField v-model="form.expiry" placeholder="MM/YY" />
          </v-col>
          <v-col cols="12" lg="6">
            <h5 class="text-subtitle-2 pb-2">CVC</h5>
            <TextField v-model="form.cvc" placeholder="CVC" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />

      <v-card-actions class="mx-4 my-3">
        <v-btn
          block
          color="secondary"
          variant="elevated"
          @click="dialogValue = false"
        >
          Add Card
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
