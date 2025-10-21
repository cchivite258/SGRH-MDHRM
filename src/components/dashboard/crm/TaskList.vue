<script lang="ts">
export default {
  data() {
    return {
      tasks: [
        {
          title: "Review and make sure nothing slips through cracks",
          subtitle:
            "If someone cracks, they lose control of their emotions or actions because they are under a lot of pressure.",
          date: "15 Sep, 2023",
        },
        {
          title: "Send meeting invites for sales campaign",
          subtitle: `I will send you a meeting invite" is grammatically incorrect. Invite is a verb and invitation is the noun.`,
          date: "20 Sep, 2023",
        },
        {
          title: "Make a creating an account profile",
          subtitle:
            "Like any other essay, a profile essay has three main parts, the introduction, body, and conclusion.",
          date: "08 Feb, 2023",
        },
        {
          title: "Change email option process",
          subtitle:
            "If people have you saved as something else in their contacts, that's the name they'll see.",
          date: "19 Jan, 2023",
        },
        {
          title: "Additional Calendar",
          subtitle:
            "Employees can use shared calendars to manage their own assignments and appointments",
          date: "03 Jan, 2023",
        },
      ],
    };
  },
};
</script>
<template>
  <Card title="Create Tasks List">
    <template #title-action
      ><ListMenu
        isSortBy
        :listItems="[
          'Today',
          'Yesterday',
          'Last 7 days',
          'Last 30 days',
          'This Month',
          'Last Month',
        ]"
    /></template>
    <v-card-text data-simplebar style="max-height: 380px">
      <v-row
        v-for="(task, index) in tasks"
        :key="'crm-task-list-' + index"
        no-gutters
      >
        <v-col cols="10" class="d-flex">
          <v-checkbox hide-details color="primary">
            <template #label>
              <div>
                <h6 class="text-subtitle-2 font-weight-bold">
                  {{ task.title }}
                </h6>
                <div class="text-muted">
                  {{ task.subtitle }}
                </div>
              </div>
            </template>
          </v-checkbox>
        </v-col>
        <v-col cols="2">
          <p class="text-muted font-weight-bold">{{ task.date }}</p>
        </v-col>
        <v-divider v-if="index !== tasks.length - 1" class="my-3" />
      </v-row>
    </v-card-text>
  </Card>
</template>
