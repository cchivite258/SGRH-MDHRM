<script lang="ts" setup>
import { colors } from "@/components/ui/utils";
import { mergeProps } from "vue";

const menuItems = ["Action", "Another Action", "Something else here"];
</script>
<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Simple Menu">
        <v-card-text>
          <div class="text-muted mb-5">
            <div class="mb-2">
              There are three main ways that menus can be defined in markup.
            </div>
            <div class="mb-2">
              The first one is by using the <b>activator</b> slot. Don’t forget
              to bind the slot <b>props</b> to the activating element.
            </div>
            <div class="mb-2">
              The second one is by using the <b>activator</b> prop with value
              <code>parent</code>. This will turn the parent element of the menu
              into the activator.
            </div>
            <div>
              The third one is to supply a CSS selector string to
              <b>activator</b> prop. This allows you to place the menu and its
              activator in separate parts of the markup.
            </div>
          </div>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn color="secondary" v-bind="props"> Activator slot </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="(listItem, index) in menuItems"
                :key="'list-item-' + index"
                @click=""
                >{{ listItem }}
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn color="secondary" class="mx-2">
            Parent activator
            <v-menu activator="parent">
              <v-list density="compact">
                <v-list-item
                  v-for="(item, index) in menuItems"
                  :key="index"
                  :value="index"
                >
                  <v-list-item-title>{{ item }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn>
          <v-btn id="menu-activator" color="secondary">
            Sibling activator
          </v-btn>
          <v-menu activator="#menu-activator">
            <v-list>
              <v-list-item
                v-for="(item, index) in menuItems"
                :key="index"
                :value="index"
              >
                <v-list-item-title>{{ item }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Menu alignment options">
        <v-card-text>
          <div class="text-muted mb-5">
            Menu can be offset relative to the activator by using the
            <code>location</code> prop. We have <b>top</b>, <b>bottom</b>,
            <b>start</b>,<b>end</b> and <b>center</b> options available. By
            default it is <b>bottom</b>.
          </div>

          <v-row>
            <v-col cols="12" lg="3">
              <div class="text-muted">For <code>location: top</code></div>
              <v-menu location="top">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" v-bind="props"> Activator slot </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item
                    v-for="(listItem, index) in menuItems"
                    :key="'list-item-' + index"
                    @click=""
                    >{{ listItem }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
            <v-col cols="12" lg="3">
              <div class="text-muted">For <code>location: bottom</code></div>
              <v-menu location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" v-bind="props"> Activator slot </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item
                    v-for="(listItem, index) in menuItems"
                    :key="'list-item-' + index"
                    @click=""
                    >{{ listItem }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
            <v-col cols="12" lg="3">
              <div class="text-muted">For <code>location: start</code></div>
              <v-menu location="start">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" v-bind="props"> Activator slot </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item
                    v-for="(listItem, index) in menuItems"
                    :key="'list-item-' + index"
                    @click=""
                    >{{ listItem }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
            <v-col cols="12" lg="3">
              <div class="text-muted">For <code>location: end</code></div>
              <v-menu location="end">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" v-bind="props"> Activator slot </v-btn>
                </template>
                <v-list density="compact" >
                  <v-list-item
                    v-for="(listItem, index) in menuItems"
                    :key="'list-item-' + index"
                    @click=""
                    >{{ listItem }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
            <v-col cols="12" lg="3">
              <div class="text-muted">For <code>location: center</code></div>
              <v-menu location="center">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" v-bind="props"> Activator slot </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item
                    v-for="(listItem, index) in menuItems"
                    :key="'list-item-' + index"
                    @click=""
                    >{{ listItem }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Menu Color Variant">
        <v-card-text>
          <div class="text-muted mb-3">
            Add <code> color="colorName" </code> prop to <code>activator</code>.
          </div>
          <v-menu v-for="(color, index) in colors" :key="'colors-' + index">
            <template v-slot:activator="{ props }">
              <v-btn :color="color.value" v-bind="props" class="ma-1">
                {{ color.text }}
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="(listItem, index) in menuItems"
                :key="'list-item-' + index"
                @click=""
                >{{ listItem }}
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Menu open on hover">
        <v-card-text>
          <div class="text-muted mb-3">
            Add <code> open-on-hover </code> prop to
            <code>v-menu</code> component.
          </div>
          <v-menu
            v-for="(color, index) in colors"
            :key="'colors-' + index"
            open-on-hover
            open-on-click
          >
            <template v-slot:activator="{ props }">
              <v-btn :color="color.value" v-bind="props" class="ma-1">
                {{ color.text }}
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="(listItem, index) in menuItems"
                :key="'list-item-' + index"
                @click=""
                >{{ listItem }}
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Menu with tooltip">
        <v-card-text>
          <div class="text-muted mb-3">
            For adding tooltip wrap <code>activator</code> with
            <code>v-tooltip</code> component.
          </div>
          <v-menu v-for="(color, index) in colors" :key="'colors-' + index">
            <template v-slot:activator="{ props: menu }">
              <v-tooltip location="top">
                <template v-slot:activator="{ props: tooltip }">
                  <v-btn
                    :color="color.value"
                    class="ma-1"
                    v-bind="mergeProps(menu, tooltip)"
                  >
                    {{ color.text }}
                  </v-btn>
                </template>
                <span>{{ color.text }}</span>
              </v-tooltip>
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="(listItem, index) in menuItems"
                :key="'list-item-' + index"
                @click=""
                >{{ listItem }}
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-text>
      </Card>
    </v-col>

    <v-col cols="12" lg="6">
      <Card title="Menu with Transitions">
        <v-card-text>
          <div class="text-muted mb-3">
            Vuetify comes with several standard transitions that you can use.
            You can also create your own and pass it as the transition argument.
          </div>
          <v-menu transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-btn color="primary" class="ma-1" v-bind="props">
                Scale Transition
              </v-btn>
            </template>

            <v-list>
              <v-list-item v-for="(item, i) in menuItems" :key="i">
                <v-list-item-title>{{ item }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-menu transition="slide-x-transition">
            <template v-slot:activator="{ props }">
              <v-btn color="primary" class="ma-1" v-bind="props">
                Slide X Transition
              </v-btn>
            </template>

            <v-list>
              <v-list-item v-for="(item, i) in menuItems" :key="i">
                <v-list-item-title>{{ item }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-menu transition="slide-y-transition">
            <template v-slot:activator="{ props }">
              <v-btn color="primary" class="ma-1" v-bind="props">
                Slide Y Transition
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-for="(item, i) in menuItems" :key="i">
                <v-list-item-title>{{ item }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
