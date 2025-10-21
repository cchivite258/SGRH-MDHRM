<script lang="ts" setup></script>
<template>
  <Card title="Additional Service">
    <v-card-text>
      <v-row>
        <v-col cols>
          <div class="text-subtitle-2 font-weight-bold">
            Environment Friendly
          </div>
          <div class="text-muted">
            The primary goal of eco-warriors is creating a better world for
            future generations.
          </div>
        </v-col>
        <v-col cols="auto" class="d-flex align-center">
          <div class="text-caption font-weight-bold me-4">$25</div>
          <v-switch density="compact" hide-details> </v-switch>
        </v-col>
      </v-row>
      <v-divider class="my-4" />
      <v-row>
        <v-col cols>
          <div class="text-subtitle-2 font-weight-bold">Care + Package</div>
          <div class="text-muted">
            Care packages are sent to acknowledge life transitions, from joyous
            occasions, such as engagements.
          </div>
        </v-col>
        <v-col cols="auto" class="d-flex align-center">
          <div class="text-caption font-weight-bold me-4">$10</div>
          <v-switch density="compact" hide-details> </v-switch>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <div class="d-flex justify-end mt-3">
    <v-btn color="primary" class="me-2"> Confirm Order </v-btn>
    <v-btn color="secondary"> Continue Shopping </v-btn>
  </div>
</template>
