<script lang="ts" setup>
import { colors } from "@/components/ui/utils";
</script>
<template>
  <Card title="Checkbox">
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" lg="4">
          <div class="text-muted font-weight-bold mb-3">Default Checkbox</div>
          <v-checkbox
            label="Default Checkbox"
            color="primary"
            hide-details
            density="compact"
          >
            <template #label><span>Default Checkbox</span></template>
          </v-checkbox>
          <v-checkbox
            :model-value="true"
            hide-details
            density="compact"
            color="primary"
          >
            <template #label>
              <span>Checked Checkbox</span>
            </template>
          </v-checkbox>
        </v-col>
        <v-col cols="12" sm="6" lg="4">
          <div class="text-muted font-weight-bold mb-3">Disabled Checkbox</div>
          <v-checkbox
            disabled
            label="Default Checkbox"
            hide-details
            density="compact"
            color="primary"
          >
            <template #label><span>Default Checkbox</span></template>
          </v-checkbox>
          <v-checkbox
            disabled
            :model-value="true"
            hide-details
            density="compact"
            color="primary"
          >
            <template #label>
              <span>Checked Checkbox</span>
            </template>
          </v-checkbox>
        </v-col>
        <v-col cols="11" sm="6" lg="auto">
          <div class="text-muted font-weight-bold mb-3">Checkbox Right</div>
          <div>
            <v-checkbox
              label="Default Checkbox"
              hide-details
              color="primary"
              density="compact"
              class="right-align-form-field"
            >
              <template #label><span>Form Checkbox Right</span></template>
            </v-checkbox>
            <v-checkbox
              :model-value="true"
              hide-details
              density="compact"
              color="primary"
              disabled
              class="right-align-form-field"
            >
              <template #label>
                <span>Disabled form checkbox Checkbox</span>
              </template>
            </v-checkbox>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Colored Checkboxes" class="mt-4">
    <v-card-text>
      <v-row no-gutters>
        <v-col
          cols="12"
          sm="6"
          lg="2"
          v-for="item in colors"
          :key="'color-' + item.value"
        >
          <v-checkbox
            :model-value="true"
            label="Default Checkbox"
            hide-details
            :color="item.value"
            density="compact"
          >
            <template #label><span>Default Checkbox</span></template>
          </v-checkbox>
          <div class="text-muted ms-3">{{ item.text }} Checkbox</div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
  <Card title="Radios" class="mt-4">
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" lg="4">
          <div class="text-muted font-weight-bold mb-3">Default radio</div>

          <v-radio-group :model-value="'first'" color="primary">
            <v-radio label="Default Checkbox" density="compact" value="first">
              <template #label><span>Default Checkbox</span></template>
            </v-radio>
            <v-radio density="compact" value="second">
              <template #label>
                <span>Checked Checkbox</span>
              </template>
            </v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" sm="6" lg="4">
          <div class="text-muted font-weight-bold mb-3">Disabled Radios</div>
          <v-radio-group :model-value="'second'" color="primary" disabled>
            <v-radio label="Default Checkbox" density="compact" value="first">
              <template #label><span>Default Checkbox</span></template>
            </v-radio>
            <v-radio density="compact" value="second">
              <template #label>
                <span>Checked Checkbox</span>
              </template>
            </v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" sm="6" lg="auto">
          <div class="text-muted font-weight-bold mb-3">Radio Right</div>
          <v-radio-group
            :model-value="'second'"
            color="primary"
            class="right-align-form-field"
          >
            <v-radio label="Default Checkbox" density="compact" value="first">
              <template #label><span>Default Checkbox</span></template>
            </v-radio>
            <v-radio density="compact" value="second">
              <template #label>
                <span>Checked Checkbox</span>
              </template>
            </v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Colored Radios" class="mt-4">
    <v-card-text>
      <v-row no-gutters>
        <v-col
          cols="12"
          sm="6"
          lg="2"
          v-for="item in colors"
          :key="'color-' + item.value"
        >
          <v-radio-group
            :model-value="'first'"
            :color="item.value"
            hide-details
          >
            <v-radio label="Default Checkbox" density="compact" value="first">
              <template #label><span>Default Checkbox</span></template>
            </v-radio>
            <v-radio density="compact" value="second">
              <template #label>
                <span>Checked Checkbox</span>
              </template>
            </v-radio>
          </v-radio-group>
          <div class="text-muted ms-1 mt-1 mb-4">{{ item.text }} Checkbox</div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
