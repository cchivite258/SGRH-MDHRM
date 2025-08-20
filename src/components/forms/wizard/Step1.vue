<script lang="ts" setup>
const emit = defineEmits(["onStepChange"]);
</script>
<template>
  <Card title="General Information" elevation="0" title-class="pb-0">
    <v-card-text class="pt-0">
      <div class="text-muted">Fill all information as below</div>
      <v-row class="mt-5">
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">Email</div>
          <TextField hide-details placeholder="Enter Email" />
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">Username</div>
          <TextField hide-details placeholder="Enter Username" />
        </v-col>
        <v-col cols="12">
          <div class="font-weight-bold mb-2">Password</div>
          <TextField
            hide-details
            placeholder="Enter Password"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions class="d-flex justify-end">
      <v-btn
        color="success"
        variant="elevated"
        @click="emit('onStepChange', 2)"
      >
        Go to more info <i class="ph-arrow-right ms-2" />
      </v-btn>
    </v-card-actions>
  </Card>
</template>
