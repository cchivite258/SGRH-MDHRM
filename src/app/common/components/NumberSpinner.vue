<script lang="ts">
export default {
  props: {
    modelValue: { type: Number, default: 0 },
  },
};
</script>
<template>
  <div class="input-step-wrapper">
    <v-btn
      class="px-0 input-step"
      size="small"
      min-width="25"
      variant="tonal"
      @click.prevent="$emit('onReduce')"
      >–</v-btn
    >
    <div class="product-quantity">
      {{ modelValue }}
    </div>
    <v-btn
      class="px-0 input-step"
      size="small"
      min-width="25"
      variant="tonal"
      @click.prevent="$emit('onAdd')"
      >+</v-btn
    >
  </div>
</template>

<style lang="scss">
.product-quantity {
  width: 35px;
  text-align: center;
  justify-content: center;
  display: flex;
  align-items: center;
  background-color: transparent;
}
</style>
