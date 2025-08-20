<script lang="ts" setup>
import { ref } from "vue";
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import { propertyTypes } from "@/components/realEstate/grid/utils";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import PropertyCard from "@/components/realEstate/createProperty/Card.vue";

const img = ref([]);
const type = ref("");
const title = ref("");
const bedroom = ref("");
const bathroom = ref("");
const state = ref("");
const sqft = ref("");
const country = ref("");
const zip = ref("");
const price = ref("");
</script>
<template>
  <v-row>
    <v-col cols="12" lg="9">
      <Card title="Information Properties">
        <v-card-text>
          <div class="font-weight-bold mb-2">
            Properties Images <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <ImageUploader v-model="img" />

          <div class="font-weight-bold mb-2">
            Properties Title <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField v-model="title" placeholder="Enter property title" />

          <div class="font-weight-bold mb-2">
            Properties Type <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <MenuSelect v-model="type" :items="propertyTypes" />
          <v-row class="mt-3">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">
                Bedroom <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="bedroom"
                placeholder="Enter Bedroom"
                hide-details
              />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">
                Bathroom <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="bathroom"
                placeholder="Enter Bathroom"
                hide-details
              />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">
                SQFT <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="sqft" placeholder="Enter sqft" hide-details />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">
                Price <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="price"
                placeholder="Enter price"
                hide-details
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col lg="4">
              <div class="font-weight-bold mb-2">
                State <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="state"
                placeholder="Enter State"
                hide-details
              />
            </v-col>
            <v-col lg="4">
              <div class="font-weight-bold mb-2">
                Country <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="country"
                placeholder="Enter Country"
                hide-details
              />
            </v-col>
            <v-col lg="4">
              <div class="font-weight-bold mb-2">
                Zip code <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="zip"
                placeholder="Enter Zip code"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="d-flex justify-end mx-3">
          <div>
            <v-btn color="secondary" variant="elevated" class="me-2">
              <i class="ph-repeat me-1" />
              Reset
            </v-btn>
            <v-btn color="primary" variant="elevated">
              <i class="ph-file-arrow-up me-1" />
              Save
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-col>
    <v-col cols="12" lg="3">
      <PropertyCard />
    </v-col>
  </v-row>
</template>
