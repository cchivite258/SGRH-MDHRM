<script lang="ts" setup>
const classes = [
  ["Heading 1", "text-h1"],
  ["Heading 2", "text-h2"],
  ["Heading 3", "text-h3"],
  ["Heading 4", "text-h4"],
  ["Heading 5", "text-h5"],
  ["Heading 6", "text-h6"],
  ["Subtitle 1", "text-subtitle-1"],
  ["Subtitle 2", "text-subtitle-2"],
  ["Body 1", "text-body-1"],
  ["Body 2", "text-body-2"],
  ["Button", "text-button"],
  ["Caption", "text-caption"],
  ["Overline", "text-overline"],
];

const text = `This is a long paragraph written to show how the line-height of an element is affected by our utilities. Classes are applied to the element itself or sometimes the parent element.`;
</script>
<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Headings">
        <v-divider />
        <v-card-text>
          <div v-for="[name, className] in classes" :key="className">
            <div :class="className">{{ name }}</div>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Font Emphasis">
        <v-divider />

        <v-card-text>
          <p class="text-subtitle-1 pb-4 font-weight-black">Black text.</p>
          <p class="text-subtitle-1 pb-4 font-weight-bold">Bold text.</p>
          <p class="text-subtitle-1 pb-4 font-weight-medium">
            Medium weight text.
          </p>
          <p class="text-subtitle-1 pb-4 font-weight-regular">
            Normal weight text.
          </p>
          <p class="text-subtitle-1 pb-4 font-weight-light">
            Light weight text.
          </p>
          <p class="text-subtitle-1 pb-4 font-weight-thin">Thin weight text.</p>
          <p class="text-subtitle-1 pb-4 font-italic">Italic text.</p>
        </v-card-text>
      </Card>

      <Card title="Text Transform" class="mt-4">
        <v-divider />
        <v-card-text>
          <div class="d-flex">
            <span class="font-weight-bold me-3 mb-2">text-lowercase: </span>
            <p class="text-lowercase">Lowercased text.</p>
          </div>
          <div class="d-flex">
            <span class="font-weight-bold me-3 mb-2">text-uppercase: </span>
            <p class="text-uppercase">Uppercased text.</p>
          </div>
          <div class="d-flex">
            <span class="font-weight-bold me-3 mb-2">text-capitalize: </span>
            <p class="text-capitalize">capitalized text.</p>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Text Alignment">
        <v-divider />
        <v-card-text>
          <div class="font-weight-bold">text-left:</div>
          <p class="mb-5 text-left">{{ text }}</p>
          <div class="font-weight-bold">text-right:</div>
          <p class="mb-5 text-right">{{ text }}</p>
          <div class="font-weight-bold">text-center:</div>
          <p class="mb-5 text-center">{{ text }}</p>
          <div class="font-weight-bold">text-justify:</div>
          <p class="mb-5 text-justify">{{ text }}</p>
          <div class="font-weight-bold">text-start:</div>
          <p class="mb-5 text-start">{{ text }}</p>
          <div class="font-weight-bold">text-end:</div>
          <p class="mb-5 text-end">{{ text }}</p>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Text Decoration">
        <v-divider />
        <v-card-text>
          <a href="#" class="mb-4 text-decoration-none">Non-underlined link</a>
          <div class="my-4 text-decoration-line-through">Line-through text</div>
          <div class="mb-4 text-decoration-overline">Overline text</div>
          <div class="mb-4 text-decoration-underline">Underline text</div>
        </v-card-text>
      </Card>

      <Card title="Text Opacity" class="mt-4">
        <v-divider />
        <v-card-text>
          <div class="text-muted mb-4">
            Opacity helper classes allow you to easily adjust the emphasis of
            text.
          </div>
          <div class="font-weight-bold">High Emphasis:</div>
          <p class="text-high-emphasis mb-3">
            High-emphasis has an opacity of 87% in light theme and 100% in dark.
          </p>
          <div class="font-weight-bold">Medium Emphasis:</div>
          <p class="text-medium-emphasis mb-3">
            Medium-emphasis text and hint text have opacities of 60% in light
            theme and 70% in dark.
          </p>
          <div class="font-weight-bold">Light Emphasis:</div>
          <p class="text-disabled mb-3">
            Disabled text has an opacity of 38% in light theme and 50% in dark.
          </p>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
