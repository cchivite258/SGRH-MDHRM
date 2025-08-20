<script lang="ts" setup>
import { colors } from "@/components/ui/utils";
import Mandatory from "@/components/ui/buttons/Mandatory.vue";
import Multiple from "@/components/ui/buttons/Multiple.vue";
import Exclusive from "@/components/ui/buttons/Exclusive.vue";
import Rounded from "@/components/ui/buttons/Rounded.vue";
</script>
<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Elevated Button">
        <v-card-text>
          <div class="text-danger mb-4">
            {{ `<v-btn variant="elevated">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'elevated-button-' + index"
            variant="elevated"
            elevation="1"
            :color="item.value"
            class="ma-1"
          >
            {{ item.text }}
          </v-btn>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Tonal Button">
        <v-card-text>
          <div class="text-danger mb-4">
            {{ `<v-btn variant="tonal">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'tonal-button-' + index"
            variant="tonal"
            :color="item.value"
            class="ma-1"
          >
            {{ item.text }}
          </v-btn>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Outlined Button">
        <v-card-text>
          <div class="text-danger mb-4">
            {{ `<v-btn variant="outlined">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'outlined-button-' + index"
            variant="outlined"
            :color="item.value"
            class="ma-1"
          >
            {{ item.text }}
          </v-btn>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Plain Button">
        <v-card-text>
          <div class="text-danger mb-4">
            {{ `<v-btn variant="plain">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'plain-button-' + index"
            variant="plain"
            :color="item.value"
            class="ma-1"
          >
            {{ item.text }}
          </v-btn>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Flat Button">
        <v-card-text>
          <div class="text-danger mb-4">
            {{ `<v-btn variant="flat">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'flat-button-' + index"
            variant="flat"
            :color="item.value"
            class="ma-1"
          >
            {{ item.text }}
          </v-btn>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Text Button">
        <v-card-text>
          <div class="text-danger mb-4">
            {{ `<v-btn variant="text">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'text-button-' + index"
            variant="text"
            :color="item.value"
            class="ma-1"
          >
            {{ item.text }}
          </v-btn>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
  <Card title="Density" class="mt-5">
    <v-card-text>
      <div>
        Buttons have density options: <b>default</b>, <b>comfortable</b> and
        <b>compact</b>. By default it is <b>default</b>
      </div>

      <v-row>
        <v-col cols="12" lg="4">
          <div class="text-muted mt-4">For density="<b>default</b>"</div>
          <div class="text-danger mb-4">
            {{ `<v-btn density="default">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'text-button-' + index"
            variant="elevated"
            :color="item.value"
            class="ma-2"
          >
            {{ item.text }}
          </v-btn>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="text-muted mt-4">For density="<b>comfortable</b>"</div>
          <div class="text-danger mb-4">
            {{ `<v-btn density="comfortable">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'text-button-' + index"
            variant="elevated"
            density="comfortable"
            :color="item.value"
            class="ma-2"
          >
            {{ item.text }}
          </v-btn>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="text-muted mt-4">For density="<b>compact</b>"</div>
          <div class="text-danger mb-4">
            {{ `<v-btn density="compact">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'text-button-' + index"
            variant="elevated"
            density="compact"
            :color="item.value"
            class="ma-2"
          >
            {{ item.text }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Size" class="mt-5">
    <v-card-text>
      <div>
        Sets the height and width of the component. Default unit is px. Can also
        use the following predefined sizes: <b>x-small</b>,<b> small</b>,<b>
          default</b
        >,<b> large</b>, and <b>x-large</b>.
      </div>

      <v-row>
        <v-col cols="12" lg="6">
          <div class="text-muted mt-4">For size="<b>x-small</b>"</div>
          <div class="text-danger mb-4">
            {{ `<v-btn size="x-small">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'text-button-' + index"
            variant="tonal"
            size="x-small"
            :color="item.value"
            class="ma-2"
          >
            {{ item.text }}
          </v-btn>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="text-muted mt-4">For size="<b>small</b>"</div>
          <div class="text-danger mb-4">
            {{ `<v-btn size="small">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'text-button-' + index"
            variant="tonal"
            size="small"
            :color="item.value"
            class="ma-2"
          >
            {{ item.text }}
          </v-btn>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="text-muted mt-4">For size="<b>large</b>"</div>
          <div class="text-danger mb-4">
            {{ `<v-btn size="large">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'text-button-' + index"
            variant="tonal"
            size="large"
            :color="item.value"
            class="ma-2"
          >
            {{ item.text }}
          </v-btn>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="text-muted mt-4">For size="<b>x-large</b>"</div>
          <div class="text-danger mb-4">
            {{ `<v-btn size="x-large">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'text-button-' + index"
            variant="tonal"
            size="x-large"
            :color="item.value"
            class="ma-2"
          >
            {{ item.text }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <v-row class="mt-4">
    <v-col cols="12" lg="6">
      <Card title="Block Button">
        <v-card-text>
          <div class="text-danger mb-4">
            {{ `<v-btn block>Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'text-button-' + index"
            variant="elevated"
            block
            :color="item.value"
            class="mb-2"
          >
            {{ item.text }}
          </v-btn>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Rounded Button">
        <v-card-text>
          <div class="text-muted">
            Use the <b>rounded</b> prop to control the border radius of a
            button.
          </div>
          <div class="text-danger mb-4 mt-5">
            {{ `<v-btn rounded="lg">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'text-button-' + index"
            variant="elevated"
            rounded="lg"
            :color="item.value"
            class="ma-1"
          >
            {{ item.text }}
          </v-btn>

          <div class="text-danger mt-5 mb-3">
            {{ `<v-btn rounded="xl">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'text-button-' + index"
            variant="elevated"
            rounded="xl"
            :color="item.value"
            class="ma-1"
          >
            {{ item.text }}
          </v-btn>
          <div class="text-danger mt-5 mb-3">
            {{ `<v-btn rounded="0">Button Text</v-btn>` }}
          </div>
          <v-btn
            v-for="(item, index) in colors"
            :key="'text-button-' + index"
            variant="elevated"
            rounded="0"
            :color="item.value"
            class="ma-1"
          >
            {{ item.text }}
          </v-btn>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Icon">
        <v-card-text>
          <div class="text-muted">
            Icons can be used for the primary content of a button.
          </div>
          <div class="d-flex align-center my-3">
            <div class="text-danger">{{ `<v-btn icon="ph-x"></v-btn>` }}</div>
            <span class="mx-2">or</span>
            <div class="text-danger">
              {{ `<v-btn icon> <i class="ph-x" /> </v-btn>` }}
            </div>
          </div>
          <div>
            <v-btn
              v-for="(item, index) in colors"
              :key="'text-button-' + index"
              variant="elevated"
              icon
              :color="item.value"
              class="ma-1"
            >
              <i class="ph-plus" />
            </v-btn>
          </div>
          <div class="mt-4">
            <v-btn
              v-for="(item, index) in colors"
              :key="'text-button-' + index"
              variant="tonal"
              icon
              :color="item.value"
              class="ma-1"
            >
              <i class="ph-minus" />
            </v-btn>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Icon density">
        <v-card-text>
          <div class="text-muted">
            Icon buttons have density options: <b>default</b>,
            <b>comfortable</b> and <b>compact</b>. By default it is
            <b>default</b>
          </div>
          <div class="mt-4">
            <v-btn
              v-for="(item, index) in colors"
              :key="'text-button-' + index"
              variant="elevated"
              icon
              density="compact"
              :color="item.value"
              class="ma-1"
            >
              <i class="ph-plus" />
            </v-btn>
          </div>

          <div class="mt-3">
            <v-btn
              v-for="(item, index) in colors"
              :key="'text-button-' + index"
              variant="elevated"
              icon
              :color="item.value"
              density="comfortable"
              class="ma-1"
            >
              <i class="ph-minus" />
            </v-btn>
          </div>
          <div class="mt-3">
            <v-btn
              v-for="(item, index) in colors"
              :key="'text-button-' + index"
              variant="elevated"
              icon
              :color="item.value"
              class="ma-1"
            >
              <i class="ph-asterisk" />
            </v-btn>
          </div>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
  <Card title="Group Button" class="mt-4">
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" class="py-2">
          <p class="font-weight-bold text-subtitle-2">Exclusive</p>
          <div class="text-muted my-1">
            {{ `<v-btn-toggle>Buttons</v-btn-toggle>` }}
          </div>
          <Exclusive
            v-for="(item, index) in colors"
            :color="item.value"
            :key="'exclusive-group-' + index"
          />
        </v-col>

        <v-col cols="12" sm="6" class="py-2">
          <p class="font-weight-bold mb-2 text-subtitle-2">Multiple</p>
          <div class="text-muted my-1">
            {{ `<v-btn-toggle multiple>Buttons</v-btn-toggle>` }}
          </div>

          <Multiple
            v-for="(item, index) in colors"
            :color="item.value"
            :key="'multiple-group-' + index"
          />
        </v-col>

        <v-col cols="12" sm="6" class="py-2">
          <p class="font-weight-bold mb-2 text-subtitle-2">Mandatory</p>
          <div class="text-muted my-1">
            {{ `<v-btn-toggle mandatory>Buttons</v-btn-toggle>` }}
          </div>
          <Mandatory
            v-for="(item, index) in colors"
            :color="item.value"
            :key="'mandatory-group-' + index"
          />
        </v-col>
        <v-col cols="12" sm="6" class="py-2">
          <p class="font-weight-bold mb-2 text-subtitle-2">Rounded</p>
          <div class="text-muted my-1">
            {{ `<v-btn-toggle rounded="xl">Buttons</v-btn-toggle>` }}
          </div>
          <Rounded
            v-for="(item, index) in colors"
            :color="item.value"
            :key="'rounded-group-' + index"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
