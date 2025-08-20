<script lang="ts" setup>
import { ref } from "vue";
import PropertyCard from "@/components/dashboard/realEstate/PropertyCard.vue";
import { rent, sales } from "@/components/dashboard/realEstate/utils";

const propertyType = ref("rent");
</script>
<template>
  <Card title="Popular Property" class="h-100">
    <template #title-action>
      <div>
        <v-btn
          size="x-small"
          color="danger"
          min-height="25"
          class="me-1"
          :variant="propertyType === 'sale' ? 'tonal' : 'text'"
          @click="propertyType = 'sale'"
        >
          Sale
        </v-btn>
        <v-btn
          size="x-small"
          color="info"
          class=""
          min-height="25"
          :variant="propertyType === 'rent' ? 'tonal' : 'text'"
          @click="propertyType = 'rent'"
        >
          Rent
        </v-btn>
      </div>
    </template>
    <v-card-text>
      <PropertyCard v-if="propertyType === 'sale'" :properties="sales" />
      <PropertyCard v-else :properties="rent" />
    </v-card-text>
  </Card>
</template>
