<script lang="ts" setup>
import ContactCard from "@/components/pages/ContactCard.vue";
import { contacts } from "@/components/pages/utils";
import Pagination from "@/app/common/components/Pagination.vue";
import { ref } from "vue";
const page = ref(1);
</script>
<template>
  <v-card-title>
    <v-row>
      <v-col class="font-weight-bold text-subtitle-1"> Friends </v-col>
      <v-col class="text-end">
        <v-btn color="primary" variant="text" to="/pages/contacts">
          View All <i class="ph-arrow-right ms-1" />
        </v-btn>
      </v-col>
    </v-row>
  </v-card-title>
  <v-card-text>
    <v-row>
      <v-col
        v-for="(item, i) in contacts"
        :key="'contact-' + i"
        cols="12"
        lg="4"
      >
        <ContactCard :data="item" />
      </v-col>
    </v-row>
    <Pagination v-model="page" />
  </v-card-text>
</template>
