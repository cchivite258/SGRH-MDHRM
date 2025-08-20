<script lang="ts" setup>
import { ref, watch } from "vue";
import { mailbox } from "@/components/email/utils";
import ListMenu from "@/app/common/components/ListMenu.vue";
import { MailBoxType } from "@/components/email/types";
import ConfirmationDialog from "@/app/common/components/ConfirmationDialog.vue";

const composeDialog = ref(false);

const prop = defineProps({
  isOpenEmail: {
    type: Boolean,
    default: false,
  },
  activeMenu: {
    type: Object,
    default: () => {},
  },
});

const isAllChecked = ref(false);
const mappedMailBoxData = mailbox.map((data) => {
  return {
    ...data,
    isChecked: false,
  };
});

const filteredMailData = ref<MailBoxType[]>(mappedMailBoxData);
const openEmail = ref<null | number>(1);
watch(
  () => prop.activeMenu,
  (activeMenu: { [key: string]: string }) => {
    if (activeMenu.email !== "") {
      const value = activeMenu.email;
      if (value === "all") {
        filteredMailData.value = mailbox;
      } else {
        filteredMailData.value = mailbox.filter(
          (data) => data.category === value
        );
      }
    } else if (activeMenu.label !== "") {
      const value = activeMenu.label;
      filteredMailData.value = mailbox.filter((data) => data.label === value);
    } else if (activeMenu.chat !== "") {
      filteredMailData.value = mailbox.filter((data) => data);
    }
  }
);

const emit = defineEmits(["onEmailClick", "onComposeMenuBtn"]);
const onEmailClick = (mail: MailBoxType) => {
  openEmail.value = mail.id;
  emit("onEmailClick", mail);
};

const onCheckAllClick = () => {
  isAllChecked.value = !isAllChecked.value;

  filteredMailData.value = filteredMailData.value.map((value) => {
    return {
      ...value,
      isChecked: isAllChecked.value,
    };
  });
};
</script>
<template>
  <v-card-text class="">
    <v-row justify="space-between">
      <v-col cols="12" lg="5">
        <TextField
          variant="solo"
          placeholder="Search here..."
          single-line
          hide-details
          class="search-box"
        >
          <template #prepend-inner>
            <i class="ph-magnifying-glass text-muted" />
          </template>
        </TextField>
      </v-col>
      <v-col v-if="$vuetify.display.smAndDown" cols="auto">
        <v-btn
          icon
          rounded
          color="success"
          variant="tonal"
          density="comfortable"
          @click="emit('onComposeMenuBtn')"
        >
          <i class="ph-list ph-lg" />
        </v-btn>
      </v-col>
      <v-col cols="auto" lg="auto">
        <v-btn
          size="x-small"
          icon="ph-arrow-clockwise"
          variant="text"
          class="text-muted"
          rounded
        />
        <ListMenu
          isIcon
          :listItems="[
            'Mark as Unread',
            'Mark as important',
            'Add to Tasks',
            'Add star',
            'Mute',
          ]"
        />
      </v-col>
    </v-row>

    <div class="d-flex align-center">
      <div class="pe-4 d-flex align-center">
        <v-checkbox color="primary" hide-details @click="onCheckAllClick" />
        <div v-if="isAllChecked">
          <v-tooltip text="Archive" location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="ph-archive"
                elevation="0"
                variant="plain"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="Report Spam" location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="ph-warning"
                elevation="0"
                variant="plain"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="Trash" location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="ph-trash"
                elevation="0"
                variant="plain"
                @click="composeDialog = true"
              />
            </template>
          </v-tooltip>
        </div>
      </div>
      <v-divider vertical length="20" class="mt-5 me-2" />

      <ListMenu
        isIcon
        icon="ph-tag"
        width="150"
        :listItems="['Support', 'Freelance', 'Social', 'Friends', 'Family']"
      />
      <ListMenu isIcon :listItems="['Mark all as Read']" />
    </div>
    <v-divider />

    <div data-simplebar class="message-list-content">
      <v-container class="ps-0">
        <v-list-item
          v-for="mail in filteredMailData"
          :key="'mail-' + mail.id"
          class="pa-0 px-2"
          color="primary"
          :active="openEmail === mail.id"
          @click=""
        >
          <template #prepend>
            <v-checkbox v-model="mail.isChecked" color="primary" hide-details />
          </template>
          <v-row
            no-gutters
            class="d-flex align-center"
            @click="onEmailClick(mail)"
          >
            <v-col cols="auto" class="mx-2">
              <i
                class="bx bxs-star"
                :class="mail.isStar ? 'text-warning' : ''"
              />
            </v-col>
            <v-col
              :cols="isOpenEmail ? 3 : 2"
              :class="mail.unread ? 'font-weight-bold' : ''"
              class="mx-1"
            >
              {{ mail.name }} {{ mail.number }}
            </v-col>
            <v-col
              class="px-2 text-truncate"
              :class="mail.unread ? 'font-weight-bold' : ''"
            >
              {{ mail.badge ? mail.badge + " - " : "" }} {{ mail.subject }} -
              <span class="text-muted">{{ mail.teaser }}</span>
            </v-col>
            <v-col cols="auto"> {{ mail.date }} </v-col>
          </v-row>
        </v-list-item>
      </v-container>
    </div>
  </v-card-text>
  <ConfirmationDialog
    v-model="composeDialog"
    @onConfirm="composeDialog = false"
  >
    <v-btn
      variant="text"
      class="confirm-close-icon"
      icon="ph-x"
      @click="composeDialog = false"
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
