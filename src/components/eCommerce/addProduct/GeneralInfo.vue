<script lang="ts" setup>
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import {
  statusOptions,
  visibilityOptions,
} from "@/components/eCommerce/addProduct/utils";
import { ref } from "vue";

const name = ref("");
const brand = ref("");
const stock = ref("");
const price = ref("");
const discount = ref("");
const status = ref("");
const visibility = ref("");
</script>
<template>
  <Card title="General Info">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="4">
          <p class="text-muted mb-0">
            An informational product can be a digital book (or e-book), a
            digital report, a white paper, a piece of software, audio or video
            files, a website, an e-zine or a newsletter.
          </p>
        </v-col>
        <v-col cols="12" lg="8">
          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">Manufacturer Name</div>
              <TextField
                v-model="name"
                hide-details
                placeholder="Enter Manufacturer Name"
              />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">Manufacturer Brand</div>
              <TextField
                v-model="brand"
                hide-details
                placeholder="Enter Manufacturer Brand"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold mb-2">
                Stock <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="stock"
                hide-details
                placeholder="Enter Stocks"
              />
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold mb-2">Price</div>
              <TextField v-model="price" hide-details placeholder="Enter Price">
                <template #prepend-inner>
                  <i class="ph-currency-dollar text-muted" />
                </template>
              </TextField>
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold mb-2">Discount</div>
              <TextField
                v-model="discount"
                hide-details
                placeholder="Enter Discount"
              >
                <template #prepend-inner>
                  <i class="ph-percent text-muted" />
                </template>
              </TextField>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" lg="6">
              <MenuSelect v-model="status" :items="statusOptions" />
            </v-col>
            <v-col cols="12" lg="6">
              <MenuSelect v-model="visibility" :items="visibilityOptions" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
