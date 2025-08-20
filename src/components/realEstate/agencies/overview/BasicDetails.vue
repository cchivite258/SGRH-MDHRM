<script lang="ts" setup>
import { Img5 } from "@/assets/images/companies/utils";
import {
  basicDetail,
  socialMedias,
} from "@/components/realEstate/agencies/overview/utils";
import { ref } from "vue";

const isBookmark = ref(false);
</script>
<template>
  <v-card>
    <v-card-text class="position-relative">
      <v-chip
        color="danger"
        variant="elevated"
        elevation="0"
        label
        class="real-estate-overview-card-chip"
      >
        <i class="ph-house-line" />
      </v-chip>
      <v-row>
        <v-col lg="4">
          <div class="bg-info-subtle rounded">
            <v-img height="230" :src="Img5" />
          </div>
        </v-col>
        <v-col lg="8">
          <div class="font-weight-bold text-subtitle-1">Real estate agency</div>
          <div class="text-muted mb-5">Dream house</div>

          <v-row
            v-for="(item, index) in basicDetail"
            :key="'basic-detail-' + index"
            no-gutters
            class="mb-3"
          >
            <v-col cols="5" class="font-weight-bold"> {{ item.title }}: </v-col>
            <v-col cols="7" :class="item.isLink ? 'text-primary' : ''">
              {{ item.value }}
            </v-col>
          </v-row>

          <div class="mt-6">
            <v-avatar
              v-for="(item, index) in socialMedias"
              :key="'social-media-' + index"
              :color="item.color"
              variant="tonal"
              rounded
              size="small"
              class="mx-1"
            >
              <i :class="item.icon" />
            </v-avatar>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <Card title="About" class="mt-4">
    <template #title-action>
      <v-btn
        icon
        density="compact"
        color="warning"
        rounded
        :variant="isBookmark ? 'elevated' : 'tonal'"
        @click="isBookmark = !isBookmark"
      >
        <i class="bx" :class="isBookmark ? ' bxs-star' : ' bx-star'" />
      </v-btn>
    </template>
    <v-card-text>
      <p class="text-muted mb-2">
        Property is
        <b>any item that a person or a business has legal title over</b>.
        Property can be tangible items, such as houses, cars, or appliances, or
        it can refer to intangible items that carry the promise of future worth,
        such as stock and bond certificates. There are two types of property. In
        legal terms, all property will be classified as either
        <b>personal property or real property</b>. This distinction between
        types of property comes from English common law, but our modern laws
        continue to distinguish between the two.
      </p>
      <p class="text-muted mb-0">
        Basic Property Unit. Definition. The basic unit of ownership that is
        recorded in the land books, land registers or equivalent. It is defined
        by unique ownership and homogeneous real property rights, and may
        consist of one or more adjacent or geographically separate parcels.
      </p>
    </v-card-text>
  </Card>
</template>
