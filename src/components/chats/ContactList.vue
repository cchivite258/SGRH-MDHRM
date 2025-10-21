<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { chatContactData, contactOptions } from "@/components/chats/utils";

const props = defineProps({
  modelValue: Object,
});
const emit = defineEmits(["update:modelValue"]);

const selectedUser = computed({
  get() {
    return props.modelValue?.user;
  },
  set(newUser: any) {
    emit("update:modelValue", { user: newUser, channel: null });
  },
});
</script>
<template>
  <Card title="Contacts" class="h-100">
    <template #title-action>
      <v-tooltip text="Add contact">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="primary"
            variant="tonal"
            min-width="30"
            size="small"
          >
            +
          </v-btn>
        </template>
      </v-tooltip>
    </template>
    <v-container>
      <TextField placeholder="Search here..." single-line hide-details>
        <template #prepend-inner>
          <i class="ph-magnifying-glass text-muted" />
        </template>
      </TextField>
    </v-container>
    <v-list
      v-model="selectedUser"
      :lines="false"
      density="compact"
      nav
      color="primary"
      data-simplebar
      class="chat-room-list px-0"
    >
      <div
        v-for="(chat, i) in chatContactData"
        :key="'chat-' + chat.title"
        class="position-relative"
      >
        <v-list-subheader class="contact-list-title">
          {{ chat.title }}
        </v-list-subheader>
        <v-list-item
          v-for="contact in chat.contacts"
          :key="'contact-' + contact.name"
          class="ps-3"
          density="compact"
          :active="contact.name === selectedUser.name"
          @click="selectedUser = contact"
        >
          <template #prepend>
            <v-avatar size="x-small" color="primary">
              <v-img v-if="contact.src" :src="contact.src" />
              <span v-else> {{ contact.profile }} </span>
            </v-avatar>
          </template>
          <template #append>
            <ListMenuWithIcon :menuItems="contactOptions" />
          </template>
          <v-list-item-title class="font-weight-bold">
            {{ contact.name }}
          </v-list-item-title>
        </v-list-item>
      </div>
    </v-list>
  </Card>
</template>
