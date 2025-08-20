<script lang="ts" setup>
import { computed, ref } from "vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { categoryOptions } from "@/components/eCommerce/products/utils";
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import { v4 as uuidv4 } from "uuid";
import { formateDate } from "@/app/common/dateFormate";

const errorMsg = ref("");
const emit = defineEmits(["update:modelValue", "onUpdate", "onCreate"]);

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  productDetail: {
    type: Object,
    default: () => {},
  },
});

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const isCreate = computed(() => {
  return prop.productDetail?.id === -1 || false;
});

const onCreateUpdate = () => {
  if (!productTitle.value) {
    errorMsg.value = "Please enter a product title";
  } else if (!productImages.value.length) {
    errorMsg.value = "Please enter a product images";
  } else if (!productCategory.value) {
    errorMsg.value = "Please enter a product category";
  } else if (!productStock.value) {
    errorMsg.value = "Please enter a product stock";
  } else if (!productPrice.value) {
    errorMsg.value = "Please enter a product price";
  }

  setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (
    !productTitle.value ||
    !productImages.value ||
    !productCategory.value ||
    !productStock.value ||
    !productPrice.value
  ) {
    return;
  }

  if (!isCreate.value) {
    emit("onUpdate", {
      ...prop.productDetail,
      title: productTitle.value,
      img: productImages.value,
      category: productCategory.value,
      stock: productStock.value,
      price: productPrice.value,
    });
  } else {
    emit("onCreate", {
      id: uuidv4(),
      title: productTitle.value,
      img: productImages.value,
      category: productCategory.value,
      stock: productStock.value,
      price: productPrice.value,
      ratings: 4.6,
      orders: "09",
      publish: `${formateDate(new Date())}`,
    });
  }
};

const productTitle = ref(prop.productDetail?.title || "");
const productImages = ref(prop.productDetail?.img || []);
const productCategory = ref(prop.productDetail?.category || "");
const productStock = ref(prop.productDetail?.stock || "");
const productPrice = ref(prop.productDetail?.price || "");
</script>
<template>
  <v-dialog v-model="dialogValue" width="600" scrollable>
    <Card :title="!isCreate ? 'Edit Product' : 'Add Product'">
      <template #title-action>
        <v-btn
          variant="plain"
          icon="ph-x"
          size="small"
          @click="dialogValue = false"
        />
      </template>
      <v-alert
        v-if="errorMsg"
        :text="errorMsg"
        variant="tonal"
        color="danger"
        class="mx-5"
        density="compact"
      />
      <v-card-text data-simplebar style="max-height: 500px">
        <h6 class="mb-2">Product title</h6>
        <TextField v-model="productTitle" placeholder="Enter product title" />

        <h6 class="my-2">Product Images</h6>
        <ImageUploader v-model="productImages" />
        <h6 class="my-2">Product category</h6>
        <MenuSelect v-model="productCategory" :items="categoryOptions" />

        <v-row class="mt-2">
          <v-col>
            <h6 class="mb-2">Stocks</h6>
            <TextField
              v-model="productStock"
              type="number"
              hide-details
              placeholder="Enter product stock"
            />
          </v-col>
          <v-col>
            <h6 class="mb-2">Price</h6>
            <TextField
              v-model="productPrice"
              type="number"
              hide-details
              placeholder="Enter product price"
            >
              <template #prepend-inner>
                <i class="ph-currency-dollar ph-lg text-muted" />
              </template>
            </TextField>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="me-3 mb-2">
        <v-spacer />
        <v-btn
          variant="text"
          color="danger"
          class=""
          @click="dialogValue = false"
        >
          <i class="ph-x me-1" /> Close
        </v-btn>
        <v-btn
          class=""
          color="primary"
          variant="elevated"
          elevation="0"
          @click="onCreateUpdate"
        >
          {{ !isCreate ? "Update" : "Add Product" }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
