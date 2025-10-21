<script lang="ts" setup>
import { ref, watch } from "vue";
import { productReviews } from "@/components/eCommerce/ProductDetails/utils";
import CreateEditReviewDialog from "@/components/eCommerce/ProductDetails/CreateEditReviewDialog.vue";
import { ProductReviewsType } from "@/components/eCommerce/ProductDetails/types";
import { formateDate } from "@/app/common/dateFormate";

const rating = ref(5);
const dialog = ref(false);
const review = ref<ProductReviewsType | null>(null);
const reviews = ref<ProductReviewsType[]>(productReviews);

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    review.value = null;
  }
});

const onCreateEdit = (id: number) => {
  if (id === -1) {
    review.value = {
      rating: "0.0",
      name: "",
      title: "",
      img: [],
      desc: "",
      date: formateDate(new Date()),
      id: -1,
    };
  } else {
    const data = reviews.value.find(
      (data: ProductReviewsType) => data.id === id
    );

    if (data) {
      review.value = data;
    }
  }
  dialog.value = true;
};

const onCreate = (formData: ProductReviewsType) => {
  // const data = {
  //   ...formData,
  //   id: reviews.value.length + 1,
  // };
  // reviews.value.push(JSON.parse(JSON.stringify(data)));
  dialog.value = false;
};

const onUpdate = (formData: ProductReviewsType) => {
  reviews.value = reviews.value.map((review) => {
    if (formData.id === review.id) {
      return {
        ...review,
        ...formData,
      };
    }

    return review;
  });

  dialog.value = false;
};
</script>
<template>
  <Card title="Ratings & Reviews">
    <template #title-action>
      <div>
        <ListMenu
          :listItems="[
            'Today',
            'Yesterday',
            'Last 7 Days',
            'Last 30 Days',
            'This Month',
            'Last Month',
          ]"
        />
        <v-btn class="" color="primary" elevation="0" @click="onCreateEdit(-1)">
          <i class="ph-plus-circle me-1" />
          Add Review
        </v-btn>
      </div>
    </template>
    <v-card-text class="mt-4">
      <v-row>
        <v-col lg="2" class="text-center mt-10">
          <div class="mb-3">
            <span class="text-h4 font-weight-bold">4.9</span>
            <span class="text-muted"> / 5.0</span>
          </div>
          <v-rating
            v-model="rating"
            density="compact"
            color="warning"
            readonly
          />
          <div><span class="font-weight-bold">3.5k</span> Reviews</div>
        </v-col>
        <v-col lg="10" data-simplebar style="max-height: 470px">
          <div
            v-for="review in reviews"
            :key="'product-review-' + review.id"
            class="dashed-border pa-3 mb-3"
          >
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex">
                <div>
                  <v-chip color="danger" size="x-small">
                    <i class="bx bxs-star" />
                    <span> {{ review.rating }}</span>
                  </v-chip>
                </div>
                <v-divider vertical class="mx-3" />
                <div>
                  <v-btn
                    color="primary"
                    variant="text"
                    size="small"
                    density="compact"
                    class=""
                  >
                    {{ review.name }}
                  </v-btn>
                </div>
              </div>
              <div>
                <span class="text-muted"> {{ review.date }} </span>
                <v-btn
                  class="mx-1"
                  size="x-small"
                  variant="tonal"
                  @click="onCreateEdit(review.id)"
                >
                  <i class="ph-pencil mx-1 ph-sm" /> Edit
                </v-btn>
                <v-btn
                  icon="ph-trash ph-sm"
                  color="danger"
                  size="x-small"
                  variant="tonal"
                  rounded
                  height="20"
                />
              </div>
            </div>
            <div class="text-subtitle-2 font-weight-bold mt-4 mb-2">
              {{ review.title }}
            </div>
            <div>
              {{ review.desc }}
            </div>
            <v-avatar
              v-for="img in review.img"
              :key="'review-img-' + img.id + '-' + review.id"
              rounded="lg"
              color="light"
              size="70"
              class="me-2 pa-3 mt-3"
            >
              <v-img :src="img.src" />
            </v-avatar>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <CreateEditReviewDialog
    v-if="review"
    v-model="dialog"
    :review="review"
    @onCreate="onCreate"
    @onUpdate="onUpdate"
  />
</template>
