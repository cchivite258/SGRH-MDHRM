<script lang="ts" setup>
import { justify, align } from "@/components/ui/grid/utils";
</script>
<template>
  <Card title="Grid Options">
    <v-card-text>
      <div class="text-muted">
        See how aspects of the Bootstrap grid system work across multiple
        devices with a handy table
      </div>
      <v-table density="compact" class="simple-border">
        <thead>
          <tr height="70">
            <th></th>
            <th class="text-center border">
              <div class="font-weight-bold">xs</div>
              <div>{{ "<600px" }}</div>
            </th>
            <th class="text-center border">
              <div class="font-weight-bold">sm</div>
              <div>{{ "600px > < 960px" }}</div>
            </th>
            <th class="text-center border">
              <div class="font-weight-bold">md</div>
              <div>{{ "960px > < 1280px" }}</div>
            </th>
            <th class="text-center border">
              <div class="font-weight-bold">lg</div>
              <div>{{ "1280px > < 1920px" }}</div>
            </th>
            <th class="text-center border">
              <div class="font-weight-bold">xl</div>
              <div>{{ "1920px > < 2560px" }}</div>
            </th>
            <th class="text-center border">
              <div class="font-weight-bold">xxl</div>
              <div>{{ "> 2560px" }}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr height="45">
            <td class="font-weight-bold border">Grid behavior</td>
            <td class="border">Horizontal at all times</td>
            <td colspan="5" class="border">
              Collapsed to start, horizontal above breakpoints
            </td>
          </tr>
          <tr height="45">
            <td class="font-weight-bold border">Used Prop</td>
            <td class="border">
              <code>{{`<v-col cols=""></v-col>`}}</code>
            </td>
            <td class="border">
              <code>{{`<v-col sm=""></v-col>`}}</code>
            </td>
            <td class="border">
              <code>{{`<v-col md=""></v-col>`}}</code>
            </td>
            <td class="border">
              <code>{{`<v-col lg=""></v-col>`}}</code>
            </td>
            <td class="border">
              <code>{{`<v-col xl=""></v-col>`}}</code>
            </td>
            <td class="border">
              <code>{{`<v-col xxl=""></v-col>`}}</code>
            </td>
          </tr>
          <tr height="45">
            <td class="font-weight-bold border">No of Columns</td>
            <td class="border" colspan="6">12</td>
          </tr>
          <tr height="45">
            <td class="font-weight-bold border">Gutter width</td>
            <td class="border" colspan="6">12px on each side of a column</td>
          </tr>
          <tr height="45">
            <td class="font-weight-bold border">Custom gutters</td>
            <td class="border" colspan="6">Yes</td>
          </tr>
          <tr height="45">
            <td class="font-weight-bold border">Nestable</td>
            <td class="border" colspan="6">Yes</td>
          </tr>
          <tr height="45">
            <td class="font-weight-bold border">Offsets</td>
            <td class="border" colspan="6">Yes</td>
          </tr>
          <tr height="45">
            <td class="font-weight-bold border">Column ordering</td>
            <td class="border" colspan="6">Yes</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </Card>

  <Card title="Flex Direction" class="mt-4">
    <v-card-text>
      <div class="text-muted">
        <code>v-row</code> is already <b>d-flex</b> class applied. We can align
        columns of it by 3 ways, i.e, <b>start</b>, <b>center</b>, <b>end</b>,
        <b>space-between</b>, <b>space-around</b> and <b>space-evenly</b>.
      </div>
      <div v-for="item in justify" :key="'justify-' + item">
        <div class="text-muted mt-3">
          For <code>justify: {{ item }}</code>
        </div>
        <v-container fluid class="bg-secondary-subtle">
          <v-row :justify="item">
            <v-col cols="4" class="bg-primary-subtle">Flex item 1</v-col>
            <v-col cols="4" class="bg-primary-subtle">Flex item 2</v-col>
          </v-row>
        </v-container>
      </div>
    </v-card-text>
  </Card>

  <Card title="Flex Align" class="mt-4">
    <v-card-text>
      <div class="text-muted">
        The <code>align-items</code> flex setting can be changed using the flex
        align classes.
      </div>
      <div v-for="item in align" :key="'align-' + item">
        <div class="text-muted mt-3">
          For <code>align: {{ item }}</code>
        </div>
        <v-container
          fluid
          class="bg-secondary-subtle pb-0"
          style="height: 100px"
        >
          <v-row :class="'align-' + item" class="h-100">
            <v-col cols="4" class="bg-primary-subtle">
              <div>Flex item 1</div>
            </v-col>
            <v-col cols="4" class="bg-primary-subtle">Flex item 2</v-col>
          </v-row>
        </v-container>
      </div>
    </v-card-text>
  </Card>
</template>
