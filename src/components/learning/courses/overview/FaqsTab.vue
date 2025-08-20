<script lang="ts" setup>
import { faqs } from "@/components/learning/courses/overview/utils";
</script>
<template>
  <v-card-text>
    <v-row>
      <v-col
        cols="12"
        lg="6"
        v-for="(faq, index) in faqs"
        :key="'course-faq-tab-' + index"
        class="d-flex"
      >
        <div class="me-2">
          <i class="ph-question ph-lg text-primary mt-1" />
        </div>
        <div>
          <div class="font-weight-bold text-subtitle-1">{{ faq.question }}</div>
          <div class="text-muted">{{ faq.answer }}</div>
        </div>
      </v-col>
    </v-row>
  </v-card-text>
</template>
