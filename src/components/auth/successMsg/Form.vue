<template>
  <div class="h-100 d-flex align-center justify-center">
    <div class="w-100">
      <v-card-title class="text-center">
        <i class="ph-smiley ph-4x text-primary"></i>

        <h5 class="text-h6 font-weight-bold">Well done !</h5>
        <div class="text-muted mt-1 font-weight-regular">
          Aww yeah, you successfully read this important message.
        </div>
      </v-card-title>
      <v-card-text>
        <v-row justify="center" class="align-center">
          <v-col cols="12" lg="8">
            <v-btn color="primary" block class="mt-4" to="/">
              Back to Dashboard
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </div>
  </div>
</template>
