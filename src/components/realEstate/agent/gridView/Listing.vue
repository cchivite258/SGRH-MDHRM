<script lang="ts" setup>
import { type PropType, computed } from "vue";
import { AgentListingType } from "@/components/realEstate/agent/types";
import { cardOptions } from "@/components/realEstate/agent/gridView/utils";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";

const { xlAndUp } = useDisplay();

const router = useRouter();

const emit = defineEmits(["onEdit", "onDelete"]);
const prop = defineProps({
  data: {
    type: Array as PropType<AgentListingType[]>,
    default: () => []
  },
  isOverview: {
    type: Boolean,
    default: false
  }
});

const onSelect = (option: string, data: AgentListingType) => {
  switch (option) {
    case "edit":
      emit("onEdit", data);
      break;
    case "view":
      router.push({ path: "/real-estate-agent/overview" });
      break;
    case "delete":
      emit("onDelete", data.id);
      break;

    default:
      break;
  }
};

const getCardWidth = computed(() => {
  if (xlAndUp.value) {
    if (prop.isOverview) {
      return 280;
    }
    return 300;
  }
  return "100%";
});
</script>
<template>
  <v-row class="mt-4">
    <v-col
      cols="12"
      :sm="isOverview ? 12 : 6"
      :md="isOverview ? 6 : 6"
      :lg="isOverview ? 4 : 3"
      :xl="isOverview ? 'auto' : 'xl'"
      v-for="(item, index) in data"
      :key="'agent-grid-list-item-' + index"
    >
      <v-card :width="getCardWidth">
        <v-card-title>
          <div class="agent-grid-card-action">
            <ListMenuWithIcon
              icon="ph-dots-three ph-lg"
              :menuItems="cardOptions"
              @onSelect="onSelect($event, item)"
            />
          </div>
        </v-card-title>
        <v-card-text class="text-center mt-7">
          <div v-if="item.new" class="agent-grid-card-tag">New</div>
          <v-badge dot :color="item.status === 'active' ? 'success' : 'danger'">
            <v-avatar :image="item.img" rounded size="70" />
          </v-badge>
          <div class="text-subtitle-1 mt-3 mb-1 font-weight-bold">
            {{ item.name }}
          </div>
          <div class="text-muted font-weight-bold mb-2">#TBS{{ item.id }}</div>
          <div class="text-muted">
            <i class="ph-map-pin" /> {{ item.location }}
          </div>
          <div class="font-weight-bold text-subtitle-1 my-3">
            {{ item.property }} Property
          </div>
        </v-card-text>
        <v-card-actions class="mx-3 mb-3">
          <v-row no-gutters>
            <v-col cols class="me-2">
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-btn
                    v-bind="props"
                    :variant="isHovering ? 'elevated' : 'tonal'"
                    block
                    color="primary"
                  >
                    <i class="ph-chat-teardrop-text me-1" /> Message
                  </v-btn>
                </template>
              </v-hover>
            </v-col>
            <v-col cols="auto">
              <v-btn
                icon="ph-phone"
                color="info"
                variant="elevated"
                rounded
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>

  <div v-if="!data.length" class="text-center pa-7">
    <div class="mb-3">
      <v-avatar color="primary" variant="tonal" size="x-large">
        <i class="ph-magnifying-glass ph-lg" />
      </v-avatar>
    </div>
    <div class="text-subtitle-1 font-weight-bold">Sorry! No Result Found</div>
    <div class="text-muted mt-1">
      We've searched more than 150+ agent We did not find any agent for you
      search.
    </div>
  </div>
</template>
