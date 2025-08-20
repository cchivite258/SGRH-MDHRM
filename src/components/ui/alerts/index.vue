<script lang="ts" setup>
import { colors } from "@/components/ui/utils";
</script>
<template>
  <Card title="Default Alerts">
    <v-card-text>
      <div class="text-muted mb-4">
        <div>
          For default alert wrap it with {{"<v-alert></v-alert>"}} component, as
          per below:
        </div>
        <div class="text-danger mt-1">
          {{ `<v-alert color="primary">Inside text of alert</v-alert>` }}
        </div>
      </div>
      <v-row>
        <v-col
          cols="12"
          lg="6"
          v-for="(item, index) in colors"
          :key="'default-alert-' + index"
        >
          <v-alert :color="item.value">
            Hi! A <b> Simple {{ item.text }} Alert</b> —check it out!
          </v-alert>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Alerts with different density" class="mt-6">
    <v-card-text>
      <div class="text-muted mb-4">
        <div>
          Alerts have density options: <b>default</b>, <b>comfortable</b> and
          <b>compact</b>. By default it is <b>default</b>
        </div>
        <div class="text-muted mt-4">For density="<b>comfortable</b>"</div>

        <div class="text-danger mt-1">
          {{ `<v-alert color="primary" density="comfortable"
            >Inside text of alert</v-alert
          >` }}
        </div>
      </div>
      <v-row>
        <v-col
          cols="12"
          lg="6"
          v-for="(item, index) in colors"
          :key="'outlined-alert-' + index"
        >
          <v-alert :color="item.value" density="comfortable">
            Hi! A <b> Comfortable {{ item.text }} Alert</b> —check it out!
          </v-alert>
        </v-col>
      </v-row>

      <div class="text-muted mt-6">For density="<b>compact</b>"</div>
      <div class="text-danger">
        {{ `<v-alert color="primary" density="compact"
          >Inside text of alert</v-alert
        >` }}
      </div>

      <v-row class="mt-1">
        <v-col
          cols="12"
          lg="6"
          v-for="(item, index) in colors"
          :key="'outlined-alert-' + index"
        >
          <v-alert :color="item.value" density="compact">
            Hi! A <b> Compact {{ item.text }} Alert</b> —check it out!
          </v-alert>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Variants of Alert" class="mt-6">
    <v-card-text>
      <div class="text-muted mb-4">
        <div>
          Alerts have variant options:
          <b>text</b>, <b>flat</b>, <b>elevated</b>, <b>tonal</b>,
          <b>outlined</b>, <b>plain</b>, <b>default</b> By default it is
          <b>default</b>
        </div>
      </div>

      <div class="text-muted mt-6">For variant="<b>elevated</b>"</div>
      <div class="text-danger">
        {{ `<v-alert variant="elevated">Inside text of alert</v-alert>` }}
      </div>
      <v-row class="mt-1">
        <v-col
          cols="12"
          lg="6"
          v-for="(item, index) in colors"
          :key="'elevated-alert-' + index"
        >
          <v-alert :color="item.value" variant="elevated" density="compact">
            Hi! A <b> Text {{ item.text }} Alert</b> —check it out!
          </v-alert>
        </v-col>
      </v-row>

      <div class="text-muted mt-6">For variant="<b>tonal</b>"</div>
      <div class="text-danger">
        {{ `<v-alert variant="tonal">Inside text of alert</v-alert>` }}
      </div>
      <v-row class="mt-1">
        <v-col
          cols="12"
          lg="6"
          v-for="(item, index) in colors"
          :key="'tonal-alert-' + index"
        >
          <v-alert :color="item.value" variant="tonal" density="compact">
            Hi! A <b> Text {{ item.text }} Alert</b> —check it out!
          </v-alert>
        </v-col>
      </v-row>
      <div class="text-muted mt-6">For variant="<b>outlined</b>"</div>
      <div class="text-danger">
        {{ `<v-alert variant="outlined">Inside text of alert</v-alert>` }}
      </div>
      <v-row class="mt-1">
        <v-col
          cols="12"
          lg="6"
          v-for="(item, index) in colors"
          :key="'outlined-alert-' + index"
        >
          <v-alert :color="item.value" variant="outlined" density="compact">
            Hi! A <b> Text {{ item.text }} Alert</b> —check it out!
          </v-alert>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Closable Alerts" class="mt-6">
    <v-card-text>
      <div class="text-muted mb-4">
        <div>For closable alert add <b>closable</b> prop.</div>
        <div class="text-danger mt-1">
          {{ `<v-alert closable>Inside text of alert</v-alert>` }}
        </div>
      </div>
      <v-row>
        <v-col
          cols="12"
          lg="6"
          v-for="(item, index) in colors"
          :key="'outlined-alert-' + index"
        >
          <v-alert
            :color="item.value"
            variant="tonal"
            density="compact"
            closable
          >
            Hi! A <b> Closable {{ item.text }} Alert</b> —check it out!
          </v-alert>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Alerts with border" class="mt-6">
    <v-card-text>
      <div class="text-muted mb-4">
        <div>
          Alerts have border options:
          <b>boolean </b>, <b>top</b>, <b>end</b>, <b>bottom</b> and
          <b>start</b>
        </div>
      </div>
      <v-row>
        <v-col
          cols="12"
          lg="6"
          v-for="(item, index) in colors"
          :key="'border-alert-' + index"
        >
          <v-alert
            :color="item.value"
            variant="tonal"
            density="compact"
            closable
            border
          >
            Hi! A <b> Bordered {{ item.text }} Alert</b> —check it out!
          </v-alert>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Advanced Alerts" class="mt-6">
    <v-card-text>
      <v-row>
        <v-col
          cols="12"
          lg="6"
          v-for="(item, index) in colors"
          :key="'outlined-alert-' + index"
        >
          <v-alert
            :color="item.value"
            variant="tonal"
            density="comfortable"
            closable
          >
            <template #prepend> <i class="bx bxl-vuejs bx-md"></i></template>
            <template #title> Alert Title </template>
            <template #text>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries.
            </template>
          </v-alert>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
