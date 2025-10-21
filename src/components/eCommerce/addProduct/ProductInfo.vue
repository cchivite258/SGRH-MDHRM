<script lang="ts" setup>
import { ref } from "vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import {
  categoriesOptions,
  productOptions,
  unitOptions,
  brandOptions,
} from "@/components/eCommerce/addProduct/utils";

const title = ref("");
const category = ref("");
const product = ref("");
const brand = ref("");
const unit = ref("");
const tags = ref([]);
const shortDscr = ref("");
const isExchangeable = ref(true);
const isRefundable = ref(false);
</script>
<template>
  <Card title="Product Information">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="4">
          <p class="text-muted">
            Product Information refers to any information held by an
            organisation about the products it produces, buys, sells or
            distributes.
          </p>
        </v-col>
        <v-col lg="8">
          <div class="font-weight-bold mb-2">
            Product Title <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField v-model="title" placeholder="Enter product title" />
          <div class="font-weight-bold mb-2">
            Category <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <MenuSelect
            v-model="category"
            class="mb-4"
            :items="categoriesOptions"
          />

          <div class="font-weight-bold mb-2">
            Product Type <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <MenuSelect v-model="product" class="mb-4" :items="productOptions" />
          <div class="font-weight-bold mb-2">
            Short Description <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextArea
            v-model="shortDscr"
            placeholder="Must enter minimum of a 100 characters"
          />

          <v-row>
            <v-col lg="6">
              <div class="font-weight-bold mb-2">
                Brand <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="brand" placeholder="Enter brand" />
            </v-col>
            <v-col lg="6">
              <div class="font-weight-bold mb-2">
                Unit <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="unit" class="mb-4" :items="unitOptions" />
            </v-col>
          </v-row>
          <div class="font-weight-bold mb-2">Tags</div>
          <MenuSelect
            v-model="tags"
            class="mb-4"
            :items="brandOptions"
            multiple
          />
          <v-row no-gutters>
            <v-col cols="6">
              <v-switch v-model="isExchangeable" color="primary">
                <template #label>
                  <span> Exchangeable </span>
                </template>
              </v-switch>
            </v-col>
            <v-col cols="6">
              <v-switch v-model="isRefundable" color="primary">
                <template #label>
                  <span> Refundable </span>
                </template>
              </v-switch>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
