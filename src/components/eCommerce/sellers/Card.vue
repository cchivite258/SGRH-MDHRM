<script lang="ts" setup>
import { ref, computed } from "vue";
const emit = defineEmits(["onRemove", "onEdit"]);
const prop = defineProps({
  data: {
    type: Array,
    required: true
  }
});

const page = ref(1);

const sellers: any = computed(() => {
  return prop.data;
});

const onRemove = (seller: any) => {
  emit("onRemove", seller);
};

const onEdit = (seller: any) => {
  emit("onEdit", seller);
};
</script>
<template>
  <v-row>
    <v-col
      cols="12"
      md="6"
      lg="3"
      v-for="seller in sellers"
      :key="'seller-' + seller.id"
    >
      <v-card>
        <v-card-title class="d-flex justify-end">
          <v-btn icon="ph-x" variant="plain" @click="onRemove(seller)" />
        </v-card-title>
        <v-card-text class="px-0">
          <div class="text-center">
            <v-avatar class="bg-primary-subtle pa-3" size="70" rounded>
              <v-img :src="seller.img" />
            </v-avatar>
            <div class="font-weight-bold text-subtitle-1 mt-5">
              {{ seller.name }}
            </div>
            <div class="text-muted">{{ seller.seller }}</div>
            <v-row class="mt-5">
              <v-col cols="4" class="dashed-border">
                <div
                  class="d-flex align-center flex-column justify-center h-100"
                >
                  <div class="font-weight-bold text-subtitle-2">
                    {{ seller.stock }}
                  </div>
                  <div class="text-muted">Item Stock</div>
                </div>
              </v-col>
              <v-col cols="4" class="dashed-border">
                <div v-if="seller.series && seller.chartOptions.chart">
                  <apexchart
                    dir="ltr"
                    :series="seller.series"
                    :color="seller.chartColor"
                    :height="50"
                    :options="seller.chartOptions"
                  />
                </div>
              </v-col>
              <v-col cols="4" class="dashed-border">
                <div
                  class="d-flex align-center flex-column justify-center h-100"
                >
                  <div class="font-weight-bold text-subtitle-1">
                    {{ seller.revenue }}
                  </div>
                  <div class="text-muted">Revenue</div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 mb-3">
          <v-row>
            <v-col cols="6">
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-btn
                    v-bind="props"
                    class=""
                    color="secondary"
                    elevation="0"
                    block
                    :variant="isHovering ? 'elevated' : 'tonal'"
                    to="/ecommerce/seller-overview"
                  >
                    View Details
                  </v-btn>
                </template>
              </v-hover>
            </v-col>
            <v-col cols="6">
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-btn
                    v-bind="props"
                    class=""
                    color="primary"
                    block
                    elevation="0"
                    :variant="isHovering ? 'elevated' : 'tonal'"
                    @click="onEdit(seller)"
                  >
                    Edit
                  </v-btn>
                </template>
              </v-hover>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
  <div class="my-5 d-flex justify-end">
    <v-pagination
      v-model="page"
      :length="1"
      density="compact"
      color="primary"
      variant="text"
      total-visible="3"
      prev-icon="ph-arrow-left"
      next-icon="ph-arrow-right"
      class="table-pagination"
    />
  </div>
</template>
