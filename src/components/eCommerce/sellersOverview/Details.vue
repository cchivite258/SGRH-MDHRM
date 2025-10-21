<script lang="ts" setup>
import { details } from "@/components/eCommerce/sellersOverview/utils";
import { socialMedias } from "@/components/auth/utils";
</script>
<template>
  <v-card elevation="0" class="position-relative">
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6509156.773725123!2d-123.79622260161696!3d37.19312212390098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb9fe5f285e3d%3A0x8b5109a227086f55!2sCalifornia%2C%20USA!5e0!3m2!1sen!2sin!4v1678106410566!5m2!1sen!2sin"
      style="border: 0; height: 200px; width: 100%"
      :allowfullscreen="true"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
    <v-card-text class="position-relative">
      <div class="seller-overview-profile-avatar">
        <v-avatar class="pa-4" size="90" rounded color="#fff">
          <v-img src="@/assets/images/companies/img-1.png" />
        </v-avatar>
      </div>
      <div class="text-center mb-4 mt-6">
        <div class="text-subtitle-1 font-weight-bold">Terry & Jerry</div>
        <div class="text-muted mt-1">Manufacture & Retail</div>
      </div>

      <v-row
        v-for="(detail, index) in details"
        :key="'seller-detail' + index"
        no-gutters
        class="mb-5"
      >
        <v-col cols="4" class="font-weight-bold"> {{ detail.title }} </v-col>
        <v-col cols :class="detail.color ? 'text-' + detail.color : ''">
          {{ detail.value }}
        </v-col>
      </v-row>
      <div class="text-center mt-4">
        <v-btn
          v-for="(item, index) in socialMedias"
          :key="'social-media-' + index"
          :color="item.color"
          density="compact"
          icon
          variant="elevated"
          rounded
          class="ma-1"
        >
          <i :class="item.icon" />
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>
