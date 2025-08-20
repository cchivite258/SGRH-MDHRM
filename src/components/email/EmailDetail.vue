<script lang="ts" setup>
import { Avatar1 } from "@/assets/images/users/utils";
import { Img2, Img6 } from "@/assets/images/small/utils";
import CKEditor from "@/app/common/components/CKEditor.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { ref } from "vue";
const prop = defineProps({
  openEmail: {
    type: Object,
    required: true,
  },
});

const dialog = ref(false);

const emit = defineEmits(["onClose"]);
const onClose = () => {
  emit("onClose");
};

const onDelete = () => {
  dialog.value = true;
};
</script>
<template>
  <v-card class="email-detail-card">
    <v-card-title>
      <div class="d-flex justify-space-between">
        <v-btn
          icon="ph-x ph-sm"
          color="danger"
          size="x-small"
          variant="tonal"
          rounded
          @click="onClose"
        />
        <div>
          <v-btn variant="plain" rounded size="small">
            <i class="bx bxs-printer bx-xs" />
          </v-btn>
          <v-btn variant="plain" rounded size="x-small" @click="onDelete">
            <i class="bx bxs-trash bx-xs" />
          </v-btn>
          <ListMenu
            isIcon
            :listItems="[
              'Mark as Unread',
              'Mark asImportant',
              'Add to Tasks',
              'Add Star',
              'Mute',
            ]"
            size="small"
          />
        </div>
      </div>
    </v-card-title>
    <v-divider />
    <v-card-text data-simplebar class="email-detail-content-scroll">
      <h5 class="text-subtitle-1 font-weight-bold mb-3">
        {{ openEmail.badge ? openEmail.badge + " - " : "" }}
        {{ openEmail.subject }}
      </h5>

      <v-expansion-panels>
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title disable-icon-rotate>
            <div class="d-flex justify-space-between">
              <div class="d-flex align-center">
                <v-avatar :image="openEmail.img" size="small" class="mx-2" />
                <div>
                  <div class="text-subtitle-2 font-weight-bold">
                    {{ openEmail.name }}
                  </div>
                  <div class="text-caption text-muted">to: me</div>
                </div>
              </div>
            </div>
            <template #actions>
              <div class="text-caption text-muted">09 Jan 2022, 11:12 AM</div>
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <p class="mb-3">Hi,</p>
            <p class="mb-3">
              Praesent dui ex, dapibus eget mauris ut, finibus vestibulum enim.
              Quisque arcu leo, facilisis in fringilla id, luctus in tortor.
            </p>
            <p class="mb-3">
              Sed elementum turpis eu lorem interdum, sed porttitor eros
              commodo. Nam eu venenatis tortor, id lacinia diam. Sed aliquam in
              dui et porta. Sed bibendum orci non tincidunt ultrices.
            </p>
            <p class="mb-3">Sincerly,</p>

            <div class="d-flex">
              <v-card width="130" class="border me-3">
                <v-img :src="Img2" />
                <v-btn
                  color="primary"
                  class="my-2"
                  variant="text"
                  size="small"
                  block
                >
                  <span class="font-weight-bold">Download</span>
                </v-btn>
              </v-card>
              <v-card width="130" class="border">
                <v-img :src="Img6" />
                <v-btn
                  color="primary"
                  class="my-2"
                  variant="text"
                  size="small"
                  block
                >
                  <span class="font-weight-bold">Download</span>
                </v-btn>
              </v-card>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-divider />
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title disable-icon-rotate>
            <div class="d-flex justify-space-between">
              <div class="d-flex align-center">
                <v-avatar :image="Avatar1" size="small" class="mx-2" />
                <div>
                  <div class="text-subtitle-2 font-weight-bold">
                    Richard Marshall
                  </div>
                  <div class="text-caption text-muted">
                    to: jackdavis@email.com
                  </div>
                </div>
              </div>
            </div>
            <template #actions>
              <div class="text-caption text-muted">09 Jan 2022, 02:15 PM</div>
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <p class="mb-3">Hi,</p>
            <p class="mb-3">
              If several languages coalesce, the grammar of the resulting
              language is more simple and regular than that of the individual.
            </p>
            <p class="mb-3">Thank you</p>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-divider />
        <v-expansion-panel elevation="0">
          <v-expansion-panel-title disable-icon-rotate>
            <div class="d-flex justify-space-between">
              <div class="d-flex align-center">
                <v-avatar :image="openEmail.img" size="small" class="mx-2" />
                <div>
                  <div class="text-subtitle-2 font-weight-bold">
                    {{ openEmail.name }}
                  </div>
                  <div class="text-caption text-muted">to: me</div>
                </div>
              </div>
            </div>
            <template #actions>
              <div class="text-caption text-muted">10 Jan 2022, 10:08 AM</div>
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <p class="mb-3">Hi,</p>
            <p class="mb-3">
              Everyone realizes why a new common language would be desirable:
              one could refuse to pay expensive translators. To achieve this, it
              would be necessary to have uniform grammar pronunciation.
            </p>
            <p class="mb-3">Thank you</p>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
    <v-card-actions class="position-relative">
      <div class="flex-grow-1">
        <div class="mb-3 font-weight-bold">Reply:</div>
        <CKEditor
          :config="{
            toolbar: ['bold', 'italic', 'link', 'bulletedList'],
          }"
        />
      </div>
      <v-menu>
        <template #activator="{ props }">
          <v-btn
            class="email-message-text-editor"
            color="success"
            variant="elevated"
            elevation="0"
          >
            <i class="bx bxs-send" />
            <v-divider vertical />
            <div v-bind="props"><i class="ph-caret-down mx-2" /></div>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item class="d-flex align-center">
            <i class="ph-timer text-muted mx-1" />
            <span>Schedule Send </span>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </v-card>
  <RemoveItemConfirmationDialog v-model="dialog" @onConfirm="dialog = false" />
</template>
