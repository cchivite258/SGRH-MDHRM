<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import TopFilters from "@/components/learning/courses/listView/TopFilters.vue";
import {
  coursesList,
  filters,
} from "@/components/learning/courses/listView/utils";
import Listing from "@/components/learning/courses/listView/Listing.vue";
import CreateEditCourseDialog from "@/components/learning/courses/CreateEditCourseDialog.vue";
import { CourseListType } from "@/components/learning/courses/listView/types";
import { v4 as uuidv4 } from "uuid";
import ConfirmationDialog from "@/app/common/components/ConfirmationDialog.vue";

const filter = ref(filters);
const dialog = ref(false);
const courseDetail = ref<CourseListType | null>(null);
const filteredData = ref<CourseListType[]>(coursesList);
const finalDataList = ref<CourseListType[]>(filteredData.value);
const confirmationDialog = ref(false);
const deleteItemId = ref<string | null | number>(null);

const query = computed(() => {
  return filter.value.query;
});

watch(query, (newQuery: string) => {
  filteredData.value = finalDataList.value.filter((product) => {
    const val = newQuery.toLowerCase();
    if (
      product.name.toLowerCase().includes(val) ||
      product.fees.includes(val)
    ) {
      return product;
    }
  });
});

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    courseDetail.value = null;
  }
});

watch(confirmationDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteItemId.value = null;
  }
});

const onCreateEdit = (data: any) => {
  if (data === -1) {
    courseDetail.value = {
      id: -1,
      img: "",
      name: "",
      category: "",
      instructor: "",
      lessons: "",
      students: "",
      duration: "",
      fees: "",
      status: "",
      img_alt: "",
      rating: "4.5",
    };
  } else {
    courseDetail.value = data;
  }
  dialog.value = true;
};

const onCreateUpdate = (data: CourseListType) => {
  if (data.id === -1) {
    filteredData.value.unshift({
      ...data,
      id: uuidv4(),
      rating: "4.3",
      img: data.img[0].src,
    });
  } else {
    filteredData.value = filteredData.value.map((item) => {
      if (item.id === data.id) {
        return {
          ...item,
          ...data,
          img: data.img[0],
        };
      }

      return item;
    });
  }
  finalDataList.value = filteredData.value;
  dialog.value = false;
};

const onDelete = (id: number | string) => {
  deleteItemId.value = id;
  confirmationDialog.value = true;
};

const onConfirmDelete = () => {
  filteredData.value = filteredData.value.filter((item: CourseListType) => {
    return item.id !== deleteItemId.value;
  });

  confirmationDialog.value = false;
};
</script>
<template>
  <Card title="Instructors List">
    <template #title-badge>
      <v-chip
        color="primary"
        label
        variant="elevated"
        elevation="0"
        density="compact"
      >
        1452
      </v-chip>
    </template>
    <template #title-action>
      <TopFilters v-model="filter" @onCreate="onCreateEdit(-1)" />
    </template>
    <v-card-text>
      <Listing
        :data="filteredData"
        @onEdit="onCreateEdit"
        @onDelete="onDelete"
      />
    </v-card-text>
  </Card>
  <CreateEditCourseDialog
    v-if="courseDetail"
    v-model="dialog"
    :courseDetail="courseDetail"
    @onCreateUpdate="onCreateUpdate"
  />
  <ConfirmationDialog v-model="confirmationDialog" @onConfirm="onConfirmDelete">
    <v-btn
      variant="text"
      class="confirm-close-icon"
      icon="ph-x"
      @click="confirmationDialog = false"
    />

    <v-card-text class="text-center ma-md-5">
      <div class="text-danger">
        <i class="ph ph-trash ph-4x"></i>
      </div>
      <div class="mt-4">
        <h4>Are you sure ?</h4>
        <p class="text-muted mx-4 mb-0 text-subtitle-1">
          Are you sure you want to remove this record ?
        </p>
      </div>
    </v-card-text>
  </ConfirmationDialog>
</template>
