<script lang="ts" setup>
import { type PropType } from "vue";
import Status from "@/app/common/components/Status.vue";
import { cardOptions } from "@/components/learning/courses/gridView/utils";
import { CourseGridType } from "@/components/learning/courses/gridView/types";
import { useRouter } from "vue-router";
import Pagination from "@/app/common/components/Pagination.vue";
const router = useRouter();

const emit = defineEmits(["onEdit", "onDelete"]);

const prop = defineProps({
  data: {
    type: Array as PropType<CourseGridType[]>,
    default: () => []
  }
});

const onSelect = (option: string, item: CourseGridType) => {
  if (option === "edit") {
    emit("onEdit", item);
  } else if (option === "delete") {
    emit("onDelete", item.id);
  } else if (option === "overview") {
    router.push({ path: "/learning/overview" });
  }
};
</script>
<template>
  <v-row class="mt-4">
    <v-col
      cols="12"
      sm="6"
      md="4"
      lg="3"
      xl
      v-for="(item, index) in data"
      :key="'grid-view-' + index"
    >
      <v-card :width="$vuetify.display.xlAndUp ? '300' : ''">
        <div
          :class="item.backgroundColor"
          class="text-center learning-widgets d-flex align-center justify-center"
        >
          <v-avatar size="80" rounded>
            <v-img :src="item.img" alt="" class="avatar-lg" />
          </v-avatar>
          <img :src="item.img" alt="" class="effect" />
        </div>
        <v-card-text>
          <div class="d-flex justify-space-between align-center">
            <div>
              <Status :status="item.badgeText" />
            </div>
            <v-btn
              icon
              density="compact"
              color="warning"
              rounded
              :variant="item.isBookmark ? 'elevated' : 'tonal'"
              @click="
                item.isBookmark === 'active'
                  ? (item.isBookmark = '')
                  : (item.isBookmark = 'active')
              "
            >
              <i
                class="bx"
                :class="item.isBookmark === 'active' ? ' bxs-star' : ' bx-star'"
              />
            </v-btn>
          </div>
          <div class="text-subtitle-2 mt-3 mb-2 text-truncate font-weight-bold">
            {{ item.name }}
          </div>
          <div class="text-muted mb-3">{{ item.category }}</div>
          <div class="text-muted d-flex align-center">
            <span class="d-flex align-center me-2">
              <i class="ph-clock me-1" /> {{ item.duration }}</span
            >
            <span class="d-flex align-center me-2">
              <i class="ph-student me-1" />{{ item.students }}
            </span>
            <span class="d-flex align-center">
              <i class="ph-graduation-cap me-1" />
              {{ item.lessons }} Lessons</span
            >
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-3 d-flex justify-space-between">
          <div>
            <v-avatar density="compact">
              <v-img :src="item.userImg" />
            </v-avatar>
            <span class="ms-2 font-weight-bold">{{ item.instructor }}</span>
          </div>
          <div>
            <ListMenuWithIcon
              icon="ph-dots-three ph-lg"
              :menuItems="cardOptions"
              variant="flat"
              color="secondary"
              @onSelect="onSelect($event, item)"
            />
          </div>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>

  <Pagination v-if="data.length" />
  <v-card v-if="!data.length" class="mt-4">
    <v-card-text class="text-center my-7">
      <v-avatar size="80" color="primary" variant="text">
        <i
          class="ph-magnifying-glass"
          style="font-size: 30px"
          color="primary"
        />
      </v-avatar>
      <div class="font-weight-bold text-subtitle-1 mb-1">
        Sorry! No Result Found
      </div>
      <div class="text-muted">
        We've searched more than 150+ customers We did not find any customers
        for you search.
      </div>
    </v-card-text>
  </v-card>
</template>
