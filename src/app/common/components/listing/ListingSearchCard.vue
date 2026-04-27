<script lang="ts" setup>
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue"

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
}>(), {
  placeholder: ""
})

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()
</script>

<template>
  <v-card class="listing-search-card">
    <v-card-text class="listing-search-card__body">
      <QuerySearch
        :model-value="props.modelValue"
        :placeholder="props.placeholder"
        prepend-inner-icon="ph-magnifying-glass"
        clearable
        density="compact"
        class="listing-search-card__field"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.listing-search-card {
  border: 1px solid #e4eaf2;
  border-radius: 16px !important;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05) !important;
}

.listing-search-card__body {
  padding: 18px;
}

.listing-search-card__field {
  margin-bottom: 0;
}

@media (max-width: 767px) {
  .listing-search-card__body {
    padding: 14px;
  }
}
</style>
