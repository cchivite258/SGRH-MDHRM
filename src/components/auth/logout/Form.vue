<template>
  <div class="h-100 d-flex align-center justify-center">
    <div class="w-100">
      <v-card-title class="text-center">
        <i class="ph-arrow-fat-line-right ph-4x"></i>

        <h5 class="text-h6 font-weight-bold">{{$t('t-you-are-logged-out')}}</h5>
        <div class="text-muted mt-1 font-weight-regular">
         
        </div>
      </v-card-title>
      <v-card-text>
        <v-row justify="center" class="align-center">
          <v-col cols="12" lg="8">
            <v-btn color="primary" block class="mt-4" to="/auth/signin">
              {{ $t('t-sign-in') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </div>
  </div>
</template>
