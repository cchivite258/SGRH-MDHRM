<script lang="ts" setup>
const items = [
  "Select all",
  "Decline Status",
  "Delivery Error",
  "Wrong Amount",
];
</script>
<template>
  <Card title="Default Select">
    <v-card-text>
      <div class="text-muted mb-2">
        Use <code>v-select</code> component for using select.
      </div>
      <v-row>
        <v-col cols="12" lg="4" md="6">
          <b>Simple form select</b>
          <v-select
            label="Select your status"
            variant="solo"
            :items="items"
            class="menu-select-filter mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4" md="6">
          <b>Rounded form select</b>

          <v-select
            label="Select your status"
            variant="solo"
            :items="items"
            rounded
            class="menu-select-filter mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4" md="6">
          <b>Disabled form select</b>
          <v-select
            label="Select your status"
            variant="solo"
            :items="items"
            disabled
            class="menu-select-filter mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4" md="6">
          <b>Multiple select</b>
          <v-select
            variant="solo"
            density="compact"
            :items="items"
            multiple
            class="menu-select-filter mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4" md="6">
          <b>Multiple chips select</b>
          <v-select
            variant="solo"
            density="compact"
            :items="items"
            multiple
            chips
            class="menu-select-filter mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4" md="6">
          <b>Multiple closable chips select</b>
          <v-select
            variant="solo"
            density="compact"
            :items="items"
            multiple
            closable-chips
            chips
            class="menu-select-filter mt-2"
          />
        </v-col>
      </v-row>
      <div class="text-subtitle-2 font-weight-bold">Select Size</div>
      <v-row>
        <v-col cols="12" lg="4">
          <v-select
            label="Select your status"
            variant="outlined"
            :items="items"
            density="compact"
            class="mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4">
          <v-select
            label="Select your status"
            variant="outlined"
            :items="items"
            density="comfortable"
            class="mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4">
          <v-select
            label="Select your status"
            variant="outlined"
            :items="items"
            class="mt-2"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
  <Card title="Autocomplete" class="mt-4">
    <v-card-text>
      <div class="text-muted mb-2">
        Use <code>v-autocomplete</code> component. This is useful when searching
        large sets of data or even dynamically.
      </div>

      <v-row>
        <v-col cols="12" lg="4" md="6">
          <b>Simple form select</b>
          <v-autocomplete
            variant="solo"
            :items="items"
            class="menu-select-filter mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4" md="6">
          <b>Rounded form select</b>

          <v-autocomplete
            variant="solo"
            :items="items"
            rounded
            class="menu-select-filter mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4" md="6">
          <b>Disabled form select</b>
          <v-autocomplete
            label="Select your status"
            variant="solo"
            :items="items"
            disabled
            class="menu-select-filter mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4" md="6">
          <b>Multiple select</b>
          <v-autocomplete
            variant="solo"
            density="compact"
            :items="items"
            multiple
            class="menu-select-filter mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4" md="6">
          <b>Multiple chips select</b>
          <v-autocomplete
            variant="solo"
            density="compact"
            :items="items"
            multiple
            chips
            class="menu-select-filter mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4" md="6">
          <b>Multiple closable chips select</b>
          <v-autocomplete
            variant="solo"
            density="compact"
            :items="items"
            multiple
            closable-chips
            chips
            class="menu-select-filter mt-2"
          />
        </v-col>
      </v-row>
      <div class="text-subtitle-2 font-weight-bold">Select Size</div>
      <v-row>
        <v-col cols="12" lg="4">
          <v-autocomplete
            label="Select your status"
            variant="outlined"
            :items="items"
            density="compact"
            class="mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4">
          <v-autocomplete
            label="Select your status"
            variant="outlined"
            :items="items"
            density="comfortable"
            class="mt-2"
          />
        </v-col>
        <v-col cols="12" lg="4">
          <v-autocomplete
            label="Select your status"
            variant="outlined"
            :items="items"
            class="mt-2"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
