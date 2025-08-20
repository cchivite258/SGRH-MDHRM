<script lang="ts" setup>
import { ref } from "vue";
import { emailMenuItems, emailMenuListItems } from "@/components/email/utils";

const emit = defineEmits(["onMenuChange", "onCompactChange"]);
const option = ref(emailMenuListItems[0]);
defineProps({
  modelValue: String,
  isCompact: Boolean,
});

const onMenuChange = (menuVal: string) => {
  emit("onMenuChange", menuVal);
};

const onDrawerClick = () => {
  emit("onCompactChange");
};

const onOptionClick = (value: any) => {
  option.value = value;
};
</script>
<template>
  <v-card
    elevation="0"
    class="email-menu-sidebar position-relative"
    id="email-menu-sidebar"
    data-simplebar
    :width="isCompact ? 75 : 100"
  >
    <v-card-text class="h-100 px-0">
      <div class="h-100 d-flex flex-column">
        <div class="text-center">
          <v-btn
            color="primary"
            icon="ph-list"
            elevation="0"
            rounded
            size="x-small"
            @click="onDrawerClick"
          />
        </div>
        <div class="text-center mt-4">
          <v-btn
            v-for="(menuItem, index) in emailMenuItems"
            :key="'chat-menu-item-' + index"
            :value="menuItem.value"
            class="mt-3 text-muted"
            elevation="0"
            variant="text"
            :to="menuItem.to"
            :color="modelValue === menuItem.value ? 'primary' : ''"
            @click="onMenuChange(menuItem.value)"
          >
            <div
              class="d-flex justify-center align-center"
              :class="isCompact ? 'flex-column' : ''"
            >
              <i :class="menuItem.icon"></i>
              <span class="" :class="isCompact ? 'mt-1' : 'ms-1'">{{
                menuItem.title
              }}</span>
            </div>
          </v-btn>
        </div>
        <div class="text-center mt-auto">
          <v-menu>
            <template #activator="{ props }">
              <v-avatar
                rounded
                :image="option.src"
                size="small"
                v-bind="props"
                style="cursor: pointer"
              />
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="(listItem, index) in emailMenuListItems"
                :key="'list-item-' + index"
                height="30"
                min-height="35"
                @click="onOptionClick(listItem)"
              >
                <v-avatar :image="listItem.src" size="28" class="me-1" />
                {{ listItem.email }}
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
