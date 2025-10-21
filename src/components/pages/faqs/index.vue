<script lang="ts" setup>
import { ref } from "vue";
import { faqs } from "@/components/pages/faqs/utils";
const faqsData = ref(faqs);
</script>
<template>
  <Card
    v-for="(faq, index) in faqsData"
    :key="'faq-section-' + index"
    :title="faq.title"
    class="mb-4"
  >
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="4" class="text-muted">
          {{ faq.description }}
        </v-col>
        <v-col cols="12" lg="8">
          <v-expansion-panels
            class="mt-4 expansion-panels faqs-expansion"
            v-model="faq.openTab"
          >
            <v-expansion-panel
              elevation="0"
              v-for="(item, index) in faq.questions"
              :key="'faq-' + index"
              class="simple-border my-1"
            >
              <v-expansion-panel-title class="text-caption font-weight-medium">
                {{ item.que }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div v-html="item.ans" class="ma-3 text-muted"></div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
