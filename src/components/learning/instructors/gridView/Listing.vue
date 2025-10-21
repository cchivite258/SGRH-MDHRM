<script lang="ts" setup>
import { type PropType, ref, computed, watch } from "vue";
import { InstructorDataType } from "@/components/learning/instructors/types";
import { cardOptions } from "@/components/learning/instructors/gridView/utils";

const emit = defineEmits(["onEdit", "onDelete"]);

const prop = defineProps({
  data: {
    type: Array as PropType<InstructorDataType[]>,
    default: () => []
  }
});

const onSelect = (option: string, item: InstructorDataType) => {
  if (option === "edit") {
    emit("onEdit", item);
  } else if (option === "delete") {
    emit("onDelete", item.id);
  }
};
</script>
<template>
  <v-row class="mt-1">
    <v-col
      cols="12"
      sm="12"
      md="6"
      lg="3"
      xl
      v-for="(item, index) in data"
      :key="'grid-list-item-' + index"
    >
      <v-card
        :min-width="$vuetify.display.mdAndUp ? '250' : '300'"
        :width="$vuetify.display.xlAndUp ? '300' : '100%'"
      >
        <v-card-title class="d-flex justify-space-between pb-0">
          <v-checkbox color="primary" v-model="item.isChecked" hide-details />
          <ListMenuWithIcon
            variant="tonal"
            density="comfortable"
            :menuItems="cardOptions"
            @onSelect="onSelect($event, item)"
          />
        </v-card-title>
        <v-card-text class="pt-0">
          <div class="text-center">
            <v-badge
              dot
              :color="item.status === 'active' ? 'success' : 'danger'"
            >
              <v-avatar size="70" rounded>
                <v-img :src="item.img" />
              </v-avatar>
            </v-badge>
            <div class="font-weight-bold mt-3 text-subtitle-2">
              {{ item.name }}
            </div>
            <div class="text-muted mt-1">{{ item.designation }}</div>
          </div>
          <div class="text-muted mt-4 mx-3">
            <div class="d-flex align-center">
              <i class="ph-envelope me-2" /> {{ item.email }}
            </div>
            <div class="d-flex align-center mt-2">
              <i class="ph-phone me-2" />{{ item.contact }}
            </div>
            <div class="d-flex align-center mt-2">
              <i class="ph-graduation-cap me-2" />{{ item.total_course }}
              Courses
            </div>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="d-flex justify-space-between mx-3">
          <v-chip color="warning" label>
            <i class="bx bxs-star" /> {{ item.rating }}
          </v-chip>
          <v-btn color="primary" to="/instructors/overview">
            Overview <i class="ph-arrow-right ms-1" />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>

    <v-col cols="12">
      <div v-if="!data.length" class="text-center">
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
      </div>
    </v-col>
  </v-row>
</template>
