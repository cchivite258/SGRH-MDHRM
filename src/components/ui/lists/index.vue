<script lang="ts" setup>
import {
  Avatar1,
  Avatar2,
  Avatar3,
  Avatar4,
} from "@/assets/images/users/utils";
const listItems = [
  {
    id: "value1",
    icon: "ph-address-book",
    avatar: Avatar1,
    message: "Send the billing agreement",
    description: `Trust fund seitan letterpress, keytar raw denim keffiyeh etsy art party before they sold out master cleanse gluten-free squid scenester freegan cosby sweater. Fanny pack portland seitan DIY, art party locavore wolf cliche high life echo park Austin.`,
  },
  {
    id: "value2",
    icon: "ph-armchair",
    avatar: Avatar2,
    message: "Send over all the documentation",
    description: `Big July earthquakes confound zany experimental vow. My girl wove six dozen plaid jackets before she quit. Six big devils from Japan quickly forgot how to waltz. try again until it looks right, and each assumenda labore aes Homo nostrud organic, assumenda labore aesthetic magna elements, buttons, everything.`,
  },
  {
    id: "value3",
    icon: "ph-bank",
    avatar: Avatar3,
    message: "Meeting with daron to review the intake form",
    description: `They all have something to say beyond the words on the page. They can come across as casual or neutral, exotic or graphic. That's why it's important to think about your message, then choose a font that fits. Cosby sweater eu banh mi, qui irure terry richardson ex squid.`,
  },
  {
    id: "value4",
    icon: "ph-basketball",
    avatar: Avatar4,
    message: "Check ulkings theme and give customer support",
    description: `Just like in the image where we talked about using multiple fonts, you can see that the background in this graphic design is blurred. Whenever you put text on top of an image, it’s important that your viewers can understand the text, and sometimes that means applying a gaussian readable.`,
  },
];
</script>
<template>
  <div class="text-muted mb-4">
    The <code>v-list</code> component is used to display information. It can
    contain an <b>avatar</b>, <b>content</b>, <b>actions</b>,
    <b>subheaders</b> and much more.
  </div>
  <v-row>
    <v-col cols="12" lg="4">
      <Card title="Default List">
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="(item, index) in listItems"
              :key="'list-item-' + index"
              :title="item.message"
            />
          </v-list>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="4">
      <Card title="List with two lines">
        <v-card-text>
          <v-list lines="two">
            <v-list-item
              v-for="(item, index) in listItems"
              :key="'list-item-' + index"
              :title="item.message"
              :subtitle="item.description"
            />
          </v-list>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="4">
      <Card title="List with three lines">
        <v-card-text>
          <v-list lines="three">
            <v-list-item
              v-for="(item, index) in listItems"
              :key="'list-item-' + index"
              :title="item.message"
              :subtitle="item.description"
            />
          </v-list>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="4">
      <Card title="List item with icon">
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="(item, index) in listItems"
              :key="'list-item-' + index"
              :title="item.message"
              :prepend-icon="item.icon"
            />
          </v-list>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="4">
      <Card title="List item with avatar">
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="(item, index) in listItems"
              :key="'list-item-' + index"
              :title="item.message"
              :prepend-avatar="item.avatar"
            />
          </v-list>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="4">
      <Card title="Rounded List">
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="(item, index) in listItems"
              :key="'list-item-' + index"
              :title="item.message"
              :value="item.id"
              rounded="xl"
              color="primary"
              :prepend-avatar="item.avatar"
            />
          </v-list>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="4">
      <Card title="Disabled List">
        <v-card-text>
          <v-list disabled>
            <v-list-item
              v-for="(item, index) in listItems"
              :key="'list-item-' + index"
              :title="item.message"
              :value="item.id"
              rounded="xl"
              color="primary"
              :prepend-avatar="item.avatar"
            />
          </v-list>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
