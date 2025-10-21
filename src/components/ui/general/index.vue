<script lang="ts" setup>
import { colors } from "@/components/ui/utils";
const breadcrumbItems = ["Home", "Library", "General"];
</script>
<template>
  <Card title="Popovers">
    <v-card-text>
      <div class="text-muted mb-2">
        The <code>v-menu</code> component shows a menu at the position of the
        element used to activate it.
      </div>
      <v-menu location="top">
        <template #activator="{ props }">
          <v-btn color="primary" v-bind="props" class="ma-1">
            Popover on top
          </v-btn>
        </template>

        <v-list>
          <v-list-item class="pa-0">
            <div class="font-weight-bold text-center mb-2 px-4">
              Top Popover
            </div>
            <v-divider class="my-2" />
            <div class="px-4">
              Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
            </div>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu location="right">
        <template #activator="{ props }">
          <v-btn color="primary" v-bind="props" class="ma-1">
            Popover on Right
          </v-btn>
        </template>

        <v-list>
          <v-list-item class="pa-0">
            <div class="font-weight-bold text-center mb-2 px-4">
              Right Popover
            </div>
            <v-divider class="my-2" />
            <div class="px-4">
              Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
            </div>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu location="bottom">
        <template #activator="{ props }">
          <v-btn color="primary" v-bind="props" class="ma-1">
            Popover on Bottom
          </v-btn>
        </template>

        <v-list>
          <v-list-item class="pa-0">
            <div class="font-weight-bold text-center mb-2 px-4">
              Bottom Popover
            </div>
            <v-divider class="my-2" />
            <div class="px-4">
              Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
            </div>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu location="left">
        <template #activator="{ props }">
          <v-btn color="primary" v-bind="props" class="ma-1">
            Popover on Left
          </v-btn>
        </template>

        <v-list>
          <v-list-item class="pa-0">
            <div class="font-weight-bold text-center mb-2 px-4">
              Left Popover
            </div>
            <v-divider class="my-2" />
            <div class="px-4">
              Vivamus sagittis lacus vel augue laoreet rutrum faucibus.
            </div>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-text>
  </Card>

  <Card title="Tooltips" class="mt-4">
    <v-card-text>
      <div class="text-muted mb-2">
        The <code>v-tooltip</code> component is useful for conveying information
        when a user hovers over an element.
      </div>
      <v-tooltip location="top" text="Tooltip on top">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" color="primary" class="ma-1"
            >Tooltip on top</v-btn
          >
        </template>
      </v-tooltip>
      <v-tooltip text="Tooltip on left" location="start">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" color="primary" class="ma-1"
            >Tooltip on left</v-btn
          >
        </template>
      </v-tooltip>
      <v-tooltip text="Tooltip on right" location="end">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" color="primary" class="ma-1"
            >Tooltip on right</v-btn
          >
        </template>
      </v-tooltip>
      <v-tooltip text="Tooltip on bottom" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" color="primary" class="ma-1"
            >Tooltip on bottom</v-btn
          >
        </template>
      </v-tooltip>
    </v-card-text>
  </Card>

  <Card title="Breadcrumbs" class="mt-4">
    <v-card-text>
      <div class="text-muted mb-2">
        The <code>v-breadcrumbs</code> component is used as a navigational
        helper and hierarchy for pages.
      </div>
      <v-breadcrumbs
        bg-color="light"
        :items="breadcrumbItems"
        rounded
        density="compact"
      />
      <v-breadcrumbs
        bg-color="light"
        :items="breadcrumbItems"
        rounded
        density="compact"
        divider="-"
        class="mt-4"
      />
      <v-breadcrumbs
        bg-color="light"
        :items="breadcrumbItems"
        rounded
        density="compact"
        class="mt-4"
      >
        <template v-slot:divider>
          <v-icon icon="mdi-chevron-right"></v-icon>
        </template>
      </v-breadcrumbs>

      <v-breadcrumbs
        bg-color="light"
        :items="breadcrumbItems"
        rounded
        density="compact"
        class="mt-4"
      >
        <template v-slot:prepend>
          <i class="ph-bank me-1" />
        </template>
      </v-breadcrumbs>
    </v-card-text>
  </Card>

  <Card title="Pagination" class="mt-4">
    <v-card-text>
      <div class="text-muted mb-4">
        The <code>v-pagination</code> component is used to separate long sets of
        data so that it is easier for a user to consume information.
      </div>
      <v-row>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold text-center mb-2">
            Default Pagination:
          </div>
          <v-pagination :length="4" color="primary" />
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold text-center mb-2">
            Rounded Pagination:
          </div>
          <v-pagination rounded="circle" :length="4" color="primary" />
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold text-center mb-2">
            Disabled Pagination:
          </div>
          <v-pagination disabled :length="4" color="primary" />
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold text-center mb-2">
            Compact Pagination:
          </div>
          <v-pagination density="compact" :length="4" color="primary" />
        </v-col>
        <v-col
          cols="12"
          lg="4"
          v-for="item in colors"
          :key="'pagination-' + item.value"
        >
          <div class="font-weight-bold text-center mb-2">
            {{ item.text }} Color Pagination:
          </div>

          <v-pagination
            variant="elevated"
            elevation="0"
            density="comfortable"
            rounded="circle"
            :length="4"
            :color="item.value"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Spinners" class="mt-4">
    <v-card-text>
      <div class="text-muted mb-3">
        The <code>v-progress-circular</code> component is used to convey data
        circularly to users. It also can be put into an indeterminate state to
        portray loading.
      </div>
      <v-progress-circular
        v-for="item in colors"
        :key="'spinner-' + item.value"
        model-value="20"
        indeterminate
        :color="item.value"
        class="me-3"
      ></v-progress-circular>
    </v-card-text>
  </Card>
</template>
