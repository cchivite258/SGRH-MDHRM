<script lang="ts">
export default {
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      colors: [
        "bg-primary-subtle",
        "bg-success-subtle",
        "bg-danger-subtle",
        "bg-dark-subtle",
      ],
      features: [
        "In stock",
        "Free delivery available",
        `Sales 10% Off Use
              Code: <b>STEEX10</b>`,
      ],
    };
  },
  computed: {
    dialogValue: {
      get() {
        return this.$props.dialog;
      },
      set(dialog: Boolean) {
        this.$emit("onDialogValueChange", dialog);
      },
    },
  },
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="800" scrollable>
    <v-card>
      <v-row>
        <v-col md="5" class="avatar-title bg-primary-subtle pa-16">
          <v-img src="@/assets/images/products/img-3.png" />
        </v-col>
        <v-col md="7">
          <div class="pa-4 h-100">
            <v-btn
              @click="dialogValue = !dialogValue"
              icon
              variant="plain"
              class="popular-dialog-close"
            >
              <i class="ph-x ph-lg" />
            </v-btn>
            <h5 class="text-subtitle-1 font-weight-bold">
              Craft Women Black Sling Bag
            </h5>

            <p class="text-muted">Fashion & Clothing</p>

            <div class="d-flex align-center my-3">
              <h5 class="text-subtitle-1 font-weight-bold">$199.99</h5>
              <del class="text-muted ms-2">$299.99</del>
            </div>
            <div class="d-flex pb-3">
              <span class="me-2">Available Colors</span>
              <div class="avatar-xxs mx-1" v-for="color in colors" :key="color">
                <div
                  class="avatar-title rounded bg-primary-subtle"
                  :class="color"
                ></div>
              </div>
            </div>

            <div
              v-for="(feature, index) in features"
              :key="'popular-product-feature' + index"
              class="py-1"
            >
              <i class="ph ph-check-circle me-2 text-success" />
              <span v-html="feature"></span>
            </div>

            <div class="popular-product-action">
              <v-btn class="me-2" color="primary">
                <i class="ph-shopping-cart align-baseline me-1" />
                Add To Cart
              </v-btn>
              <v-btn variant="tonal">
                View Details
                <i class="ph-arrow-right align-baseline ms-1" />
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>
