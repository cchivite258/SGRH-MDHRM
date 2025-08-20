<script lang="ts" setup>
import { Avatar1 } from "@/assets/images/users/utils";
import { chatMenuItems } from "@/components/chats/utils";
const emit = defineEmits(["onMenuChange"]);

const dummyAction = ["Action", "Another Action", "Something else here"];
defineProps({
  modelValue: String
});

const onMenuChange = (menuVal: string) => {
  emit("onMenuChange", menuVal);
};
</script>
<template>
  <v-card class="chat-wrapper-menu h-100">
    <v-card-text class="text-center h-100 position-relative">
      <v-badge dot color="success" offset-x="-5" offset-y="-5">
        <v-avatar rounded :image="Avatar1" size="large"></v-avatar>
      </v-badge>
      <div class="d-flex justify-center">
        <div class="d-flex flex-column">
          <v-tooltip
            v-for="(chatMenuItem, index) in chatMenuItems"
            :key="'chat-menu-item-' + index"
            :text="chatMenuItem.title"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                rounded="xl"
                :icon="chatMenuItem.icon"
                :value="chatMenuItem.value"
                height="40"
                width="40"
                class="mt-2 text-muted"
                :variant="
                  modelValue === chatMenuItem.value ? 'elevated' : 'text'
                "
                :color="modelValue === chatMenuItem.value ? 'primary' : ''"
                @click="onMenuChange(chatMenuItem.value)"
              />
            </template>
          </v-tooltip>
        </div>
        <v-menu>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              color="secondary"
              min-width="30"
              width="40"
              height="40"
              min-height="30"
              class="chat-setting-btn"
            >
              <i class="ph-gear ph-lg"></i>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="item in dummyAction"
              height="28"
              min-height="28"
              @click=""
            >
              {{ item }}
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-card-text>
  </v-card>
</template>
