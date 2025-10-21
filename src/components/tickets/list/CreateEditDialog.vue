<script lang="ts" setup>
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import {
  priorityOption,
  statusOption,
  avatars,
} from "@/components/tickets/list/utils";
import { ref, computed, type PropType } from "vue";
import {
  AssigneeImgType,
  TicketListingType,
} from "@/components/tickets/list/types";

const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<TicketListingType>,
    required: true,
  },
});

const isCreate = prop.data.id === -1;
const errorMsg = ref("");
const formData = ref(prop.data);

const assignees = computed(() => {
  return formData.value.assignedTo.map((item) => item.id);
});

const clientName = ref(formData.value.clientName || "");
const assignedTo = ref<string[]>(assignees.value);
const ticketTitle = ref(formData.value.ticketTitle || "");
const createDate = ref(formData.value.createDate || "");
const dueDate = ref(formData.value.dueDate || "");
const priority = ref(formData.value.priority || "");
const status = ref(formData.value.status || "");

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const onAssigneeClick = (avatar: AssigneeImgType) => {
  if (isAvatarIncluded(avatar.id)) {
    const index: number = assignedTo.value.indexOf(avatar.id);
    if (index > -1) {
      assignedTo.value.splice(index, 1);
    }
  } else {
    assignedTo.value.push(avatar.id);
  }
};

const isAvatarIncluded = (id: string) => {
  return assignedTo.value.includes(id);
};

const onSave = () => {
  if (!clientName.value) {
    errorMsg.value = "Please Enter clientName";
  } else if (!assignedTo.value.length) {
    errorMsg.value = "Please Enter assignedTo";
  } else if (!ticketTitle.value) {
    errorMsg.value = "Please Enter ticketTitle";
  } else if (!createDate.value) {
    errorMsg.value = "Please Enter createDate";
  } else if (!dueDate.value) {
    errorMsg.value = "Please Enter dueDate";
  } else if (!priority.value) {
    errorMsg.value = "Please Enter priority";
  } else if (!status.value) {
    errorMsg.value = "Please Enter status";
  }

  setTimeout(() => {
    errorMsg.value = "";
  }, 3000);

  if (
    !clientName.value ||
    !assignedTo.value.length ||
    !ticketTitle.value ||
    !createDate.value ||
    !dueDate.value ||
    !priority.value ||
    !status.value
  ) {
    return;
  }

  errorMsg.value = "";

  const addedAvatars: any = avatars.filter((item) => isAvatarIncluded(item.id));
  const data = {
    ...prop.data,
    clientName: clientName.value,
    assignedTo: addedAvatars,
    ticketTitle: ticketTitle.value,
    createDate: createDate.value,
    dueDate: dueDate.value,
    priority: priority.value,
    status: status.value,
  };

  emit("onCreateUpdate", data);
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="550" :scrollable="false" persistent>
    <Card
      :title="isCreate ? 'Add Ticket' : 'Edit Ticket'"
      title-class="py-0"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-alert
        v-if="errorMsg"
        :text="errorMsg"
        variant="tonal"
        color="danger"
        class="mx-5 mt-3"
        density="compact"
      />
      <v-card-text data-simplebar style="max-height: calc(100vh - 500px)">
        <div class="font-weight-bold mb-2">
          Client Name <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="clientName" placeholder="Enter Client name" />
        <div class="font-weight-bold">Assigned To : {{ assignedTo }}</div>

        <div data-simplebar style="max-height: 200px" class="mb-4">
          <div
            v-for="avatar in avatars"
            :key="avatar.id"
            class="my-3 d-flex justify-space-between"
          >
            <div class="d-flex align-center">
              <v-avatar size="small" class="me-2">
                <v-img :src="avatar.assigneeImg" />
              </v-avatar>
              <div class="font-weight-bold">{{ avatar.assigneeName }}</div>
            </div>
            <v-btn
              color="light"
              density="compact"
              @click="onAssigneeClick(avatar)"
            >
              {{ isAvatarIncluded(avatar.id) ? "remove" : "Add" }}
            </v-btn>
          </div>
        </div>
        <div class="font-weight-bold mb-2">
          Ticket Title <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="ticketTitle" placeholder="Ticket Title" />
        <v-row>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              Create Date <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <VueDatePicker
              v-model="createDate"
              :teleport="true"
              :enable-time-picker="false"
            />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              Due Date <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <VueDatePicker
              v-model="dueDate"
              :teleport="true"
              :enable-time-picker="false"
            />
          </v-col>
        </v-row>
        <div class="font-weight-bold mb-2 mt-4">
          Priority <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <MenuSelect v-model="priority" :items="priorityOption" />
        <div class="font-weight-bold mb-2 mt-4">
          Status <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <MenuSelect v-model="status" :items="statusOption" />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-row justify="end">
          <v-col class="text-right">
            <v-btn color="danger" @click="dialogValue = false"> Close</v-btn>
            <v-btn color="primary" variant="elevated" @click="onSave">
              {{ isCreate ? "Create Ticket" : "Update Ticket" }}</v-btn
            >
          </v-col>
        </v-row>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
