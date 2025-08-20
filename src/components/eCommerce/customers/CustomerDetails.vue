<script lang="ts" setup>
import { ref } from "vue";
import { socialMedia, orders } from "@/components/eCommerce/customers/utils";
import Status from "@/app/common/components/Status.vue";
import CKEditor from "@/app/common/components/CKEditor.vue";

const prop = defineProps({
  customer: {
    type: Object,
    required: true,
  },
});

const isFollowed = ref(true);
const editorId = "eCommerce-customer-private-note";
</script>
<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <div class="d-flex">
        <v-avatar rounded="lg" size="50" class="me-2">
          <v-img :src="customer.img" />
        </v-avatar>
        <div>
          <div class="text-subtitle-1 font-weight-bold">
            {{ customer.name }}
          </div>
          <div class="text-primary">
            @{{
              customer.name.split(" ").slice(-1).join("").toLowerCase() ||
              "@mosciski"
            }}
          </div>
        </div>
      </div>
      <div>
        <v-hover>
          <template v-slot:default="{ isHovering, props }">
            <v-btn
              v-bind="props"
              class=""
              color="primary"
              elevation="0"
              :variant="isFollowed || isHovering ? 'elevated' : 'tonal'"
              @click="isFollowed = !isFollowed"
            >
              <i v-if="isFollowed" class="ph-user-circle-plus me-1" />
              <i v-else class="ph-plus me-1" />
              {{ isFollowed ? "UnFollow" : "Follow" }}
            </v-btn>
          </template>
        </v-hover>
        <v-hover>
          <template v-slot:default="{ isHovering, props }">
            <v-btn
              v-bind="props"
              icon="ph-trash ph-lg"
              color="danger"
              rounded
              density="comfortable"
              :variant="isHovering ? 'elevated' : 'tonal'"
              class="ms-2"
            />
          </template>
        </v-hover>
      </div>
    </v-card-title>
    <v-card-text>
      <div>
        <span> Social media: </span>
        <v-hover v-for="(media, index) in socialMedia" :key="'media-' + index">
          <template v-slot:default="{ isHovering, props }">
            <v-btn
              v-bind="props"
              :color="media.color"
              rounded
              density="comfortable"
              :variant="isHovering ? 'elevated' : 'tonal'"
              class="ms-2"
              icon
              size="small"
              elevation="0"
            >
              <i :class="media.icon" />
            </v-btn>
          </template>
        </v-hover>
      </div>
      <div class="mt-5">
        <v-row no-gutters class="mb-3">
          <v-col cols="4" class="font-weight-bold"> Email </v-col>
          <v-col cols="8"> {{ customer.email }} </v-col>
        </v-row>
        <v-row no-gutters class="mb-3">
          <v-col cols="4" class="font-weight-bold"> Contact </v-col>
          <v-col cols="8"> {{ customer.phone }} </v-col>
        </v-row>
        <v-row no-gutters class="mb-3">
          <v-col cols="4" class="font-weight-bold"> Joining Date </v-col>
          <v-col cols="8"> {{ customer.create_date }} </v-col>
        </v-row>
        <v-row no-gutters class="mb-3">
          <v-col cols="4" class="font-weight-bold"> Email </v-col>
          <v-col cols="8"> <Status :status="customer.status" /> </v-col>
        </v-row>
      </div>

      <div class="font-weight-bold">Private Notes</div>
      <div class="ckeditor-wrapper mt-3">
        <div :id="editorId"></div>
        <CKEditor :id="editorId" />
      </div>

      <Card title="Order History">
        <v-card-text data-simplebar style="max-height: 395px">
          <v-container
            v-for="(product, index) in orders"
            :key="'popular-product-' + index"
          >
            <v-row class="dashed-border">
              <v-col cols="auto" class="pe-0">
                <v-avatar rounded="0" color="light" class="pa-2" size="large">
                  <v-img :src="product.src" />
                </v-avatar>
              </v-col>
              <v-col class="d-flex justify-space-between">
                <div>
                  <h5 class="text-subtitle-2 font-weight-bold mb-1">
                    {{ product.title }}
                  </h5>
                  <div class="text-muted">
                    <i class="ph-star align-baseline"></i> {{ product.ratings }}
                    <i class="ph-shopping-cart align-baseline"></i>
                    {{ product.cart }}
                  </div>
                </div>
                <div class="d-flex align-center">
                  <span class="text-primary font-weight-bold text-subtitle-2"
                    >${{ product.price }}</span
                  >
                  <v-btn
                    color="secondary"
                    elevation="0"
                    min-width="27"
                    height="27"
                    class="ms-2 px-1"
                  >
                    <i class="ph-arrow-right"></i>
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </Card>
    </v-card-text>
  </v-card>
</template>
