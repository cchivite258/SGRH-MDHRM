<script lang="ts" setup>
import { computed, ref } from "vue";
import CKEditor from "@/app/common/components/CKEditor.vue";
const isCc = ref(false);
const isBcc = ref(false);
const editorId = "compose-dialog-message-editor";

const sender = ref("support@themesbrand.com");
const cc = ref("");
const bcc = ref("");
const subject = ref("");
const email = ref("");
const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});
</script>
<template>
  <v-dialog v-model="dialogValue" width="800" scrollable>
    <v-card>
      <v-card-title
        class="d-flex justify-space-between bg-primary-subtle align-center"
      >
        <h4 class="text-subtitle-1 font-weight-bold">New Message</h4>
        <v-btn icon="ph-x ph-lg" variant="plain" @click="dialogValue = false" />
      </v-card-title>
      <v-card-text data-simplebar style="max-height: 450px">
        <TextField v-model="sender">
          <template #append-inner>
            <v-btn
              v-model="isCc"
              variant="text"
              class=""
              size="x-small"
              @click="isCc = !isCc"
            >
              <span class="font-weight-bold">Cc</span>
            </v-btn>
            <v-btn
              v-model="isBcc"
              variant="text"
              class="me-3"
              size="x-small"
              @click="isBcc = !isBcc"
            >
              <span class="font-weight-bold">Bcc</span>
            </v-btn>
          </template>
        </TextField>
        <div v-show="isCc">
          <div>Cc:</div>
          <TextField v-model="cc" />
        </div>
        <div v-show="isBcc">
          <div>Bcc:</div>
          <TextField v-model="bcc" />
        </div>
        <TextField v-model="subject" placeholder="Subject" />
        <div class="ckeditor-wrapper">
          <div :id="editorId"></div>
          <CKEditor v-model="email" :id="editorId" />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          color="danger"
          class=""
          @click="dialogValue = false"
        >
          Discard
        </v-btn>
        <v-menu>
          <template #activator="{ props }">
            <v-btn
              class=""
              color="success"
              variant="elevated"
              elevation="0"
              @click="dialogValue = false"
            >
              Send
              <v-divider vertical />
              <div v-bind="props"><i class="ph-caret-down ms-3"></i></div>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item class="d-flex align-center">
              <i class="ph-timer text-muted me-2"></i>
              <span>Schedule Send </span>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
