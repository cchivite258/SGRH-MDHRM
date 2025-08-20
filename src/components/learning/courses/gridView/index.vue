<script lang="ts" setup>
import TopFilters from "@/components/learning/courses/gridView/TopFilters.vue";
import { ref, watch } from "vue";
import CreateEditCourseDialog from "@/components/learning/courses/CreateEditCourseDialog.vue";
import { coursesGrid } from "@/components/learning/courses/gridView/utils";
import { CourseGridType } from "@/components/learning/courses/gridView/types";
import { Avatar2 } from "@/assets/images/users/utils";
import Listing from "@/components/learning/courses/gridView/Listing.vue";
import { v4 as uuidv4 } from "uuid";
import ConfirmationDialog from "@/app/common/components/ConfirmationDialog.vue";

const query = ref("");
const courseDetail = ref<CourseGridType | null>(null);
const dialog = ref(false);

const filteredData = ref<CourseGridType[]>(coursesGrid);
const finalDataList = ref<CourseGridType[]>(filteredData.value);

const confirmationDialog = ref(false);
const deleteItemId = ref<string | null | number>(null);

watch(query, (newQuery: string) => {
  filteredData.value = finalDataList.value.filter((item) => {
    const val = newQuery.toLowerCase();
    if (
      item.name.toLowerCase().includes(val) ||
      item.fees.includes(val) ||
      item.instructor.toLowerCase().includes(val)
    ) {
      return item;
    }
  });
});

watch(confirmationDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteItemId.value = null;
  }
});

const onCreateEdit = (data: CourseGridType | null) => {
  if (!data) {
    courseDetail.value = {
      id: -1,
      img: "",
      badgeText: "",
      backgroundColor: "",
      isBookmark: "",
      name: "",
      category: "",
      duration: "",
      students: 256,
      lessons: 15,
      userImg: Avatar2,
      instructor: "",
      fees: "",
      rating: "",
      status: "",
    };
  } else {
    courseDetail.value = data;
  }
  dialog.value = true;
};

const onCreateUpdate = (data: CourseGridType) => {
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
  filteredData.value = filteredData.value.filter((item: CourseGridType) => {
    return item.id !== deleteItemId.value;
  });

  confirmationDialog.value = false;
};
</script>
<template>
  <TopFilters v-model="query" @onCreate="onCreateEdit" />
  <Listing :data="filteredData" @onEdit="onCreateEdit" @onDelete="onDelete" />
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
