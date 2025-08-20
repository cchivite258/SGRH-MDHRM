<script lang="ts" setup>
const borderOptions = [
  "rounded-0",
  "rounded-sm",
  "rounded",
  "rounded-lg",
  "rounded-xl",
  "rounded-pill",
  "rounded-circle",
  "rounded-shaped",
];
</script>
<template>
  <Card title="Border Radius">
    <v-card-text>
      <div class="text-muted mb-5">
        Use border utilities to quickly style the border-radius of any element.
      </div>
      <div class="d-flex flex-wrap">
        <div
          v-for="option in borderOptions"
          :key="option"
          class="mx-5 d-flex flex-column align-center"
        >
          <v-sheet :class="option" height="50" width="50" border />
          <div class="mt-2">
            <code> {{ option }} </code>
          </div>
        </div>
      </div>
    </v-card-text>
  </Card>
  <Card title="Display Property" class="mt-4">
    <v-card-text>
      <div class="text-muted mb-5">
        Use below-mentioned class to an element to display the value of
        components and more with our display utilities.
      </div>
      <v-row>
        <v-col cols="12" lg="6">
          <div class="mb-3"><b>Display classes</b></div>
          <v-table class="simple-border" density="comfortable">
            <thead class="bg-light">
              <tr>
                <th>Display Property</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Display: none</td>
                <td><code>.d-none</code></td>
              </tr>
              <tr>
                <td>display: inline</td>
                <td><code>.d-inline</code></td>
              </tr>
              <tr>
                <td>display: inline-block</td>
                <td><code>.d-inline-block</code></td>
              </tr>
              <tr>
                <td>display: block</td>
                <td><code>.d-block</code></td>
              </tr>
              <tr>
                <td>display: table</td>
                <td><code>.d-table</code></td>
              </tr>
              <tr>
                <td>display: table-cell</td>
                <td><code>.d-table-cell</code></td>
              </tr>
              <tr>
                <td>display: table-row</td>
                <td><code>.d-table-row</code></td>
              </tr>
              <tr>
                <td>display: flex</td>
                <td><code>.d-flex</code></td>
              </tr>
              <tr>
                <td>display: inline-flex</td>
                <td><code>.d-inline-flex</code></td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="mb-3"><b>Hiding elements </b></div>
          <v-table class="simple-border" density="comfortable">
            <thead class="bg-light">
              <tr>
                <th>Scree Size</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Hidden on all</td>
                <td><code> .d-none</code></td>
              </tr>
              <tr>
                <td>Hidden only on xs</td>
                <td><code> .d-none .d-sm-flex</code></td>
              </tr>
              <tr>
                <td>Hidden only on sm</td>
                <td><code> .d-sm-none .d-md-flex</code></td>
              </tr>
              <tr>
                <td>Hidden only on md</td>
                <td><code> .d-md-none .d-lg-flex</code></td>
              </tr>
              <tr>
                <td>Hidden only on lg</td>
                <td><code> .d-lg-none .d-xl-flex</code></td>
              </tr>
              <tr>
                <td>Hidden only on xl</td>
                <td><code> .d-xl-none .d-xxl-flex</code></td>
              </tr>
              <tr>
                <td>Hidden only on xxl</td>
                <td><code> .d-xxl-none</code></td>
              </tr>
              <tr>
                <td>Visible on all</td>
                <td><code> .d-flex</code></td>
              </tr>
              <tr>
                <td>Visible only on xs</td>
                <td><code> .d-flex .d-sm-none</code></td>
              </tr>
              <tr>
                <td>Visible only on sm</td>
                <td><code> .d-none .d-sm-flex .d-md-none</code></td>
              </tr>
              <tr>
                <td>Visible only on md</td>
                <td><code> .d-none .d-md-flex .d-lg-none</code></td>
              </tr>
              <tr>
                <td>Visible only on lg</td>
                <td><code> .d-none .d-lg-flex .d-xl-none</code></td>
              </tr>
              <tr>
                <td>Visible only on xl</td>
                <td><code> .d-none .d-xl-flex .d-xxl-none</code></td>
              </tr>
              <tr>
                <td>Visible only on xxl</td>
                <td><code> .d-none .d-xxl-flex</code></td>
              </tr>
            </tbody>
          </v-table>
        </v-col>

        <v-col cols="12" lg="6">
          <div class="mb-2"><b>Display in print </b></div>
          <div class="text-muted mb-3">
            Change the display value of elements when printing with our print
            display utility classes.
          </div>

          <div><code>.d-print-none</code></div>
          <div><code>.d-print-inline</code></div>
          <div><code>.d-print-inline-block</code></div>
          <div><code>.d-print-block</code></div>
          <div><code>.d-print-table</code></div>
          <div><code>.d-print-table-row</code></div>
          <div><code>.d-print-table-cell</code></div>
          <div><code>.d-print-flex</code></div>
          <div><code>.d-print-inline-flex</code></div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Shadows" class="mt-4">
    <v-card-text>
      <div class="text-muted mb-3">
        We can add shadow to any element by adding <code>elevation</code> prop
        to it.
      </div>
      <v-row>
        <v-col cols="12">
          <div class="d-flex flex-wrap">
            <v-sheet
              border
              height="120"
              width="120"
              rounded
              :elevation="0"
              class="position-relative ma-2 d-flex align-center justify-center"
            >
              <code>elevation="0</code>
            </v-sheet>
            <v-sheet
              v-for="i in 24"
              :key="i"
              border
              height="120"
              width="120"
              rounded
              :elevation="i"
              class="position-relative ma-2 d-flex align-center justify-center"
            >
              <code>elevation="{{ i }}"</code>
            </v-sheet>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
  <Card title="sizing" class="mt-4">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">Height</div>
          <div class="text-muted mb-4">
            Specify the height property of <b>block level elements</b> with a
            utility class. The following classes are applied using the format
            .{prefix}-{size} ; where <b>prefix</b> is <code>h</code> and
            <b>size</b> is the <code>value</code>.
          </div>
          <v-table density="compact" class="simple-border">
            <thead>
              <tr>
                <th>Class</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>height: auto</td>
                <td><code>h-auto</code></td>
              </tr>
              <tr>
                <td>height: 100dvh</td>
                <td><code>h-screen</code></td>
              </tr>
              <tr>
                <td>height: 0</td>
                <td><code>h-0</code></td>
              </tr>
              <tr>
                <td>height: 25%</td>
                <td><code>h-25</code></td>
              </tr>
              <tr>
                <td>height: 50%</td>
                <td><code>h-50</code></td>
              </tr>
              <tr>
                <td>height: 75%</td>
                <td><code>h-75</code></td>
              </tr>
              <tr>
                <td>height: 100%</td>
                <td><code>h-100</code></td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">Wight</div>
          <div class="text-muted mb-4">
            Specify the width property of <b>block level elements</b> with a
            utility class. The following classes are applied using the format
            .{prefix}-{size} ; where <b>prefix</b> is <code>w</code> and
            <b>size</b> is the <code>value</code>.
          </div>
          <v-table density="compact" class="simple-border">
            <thead>
              <tr>
                <th>Class</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>width: auto</td>
                <td><code>w-auto </code></td>
              </tr>
              <tr>
                <td>width: 0</td>
                <td><code>w-0 </code></td>
              </tr>
              <tr>
                <td>width: 25%</td>
                <td><code>w-25 </code></td>
              </tr>
              <tr>
                <td>width: 50%</td>
                <td><code>w-50 </code></td>
              </tr>
              <tr>
                <td>width: 75%</td>
                <td><code>w-75 </code></td>
              </tr>
              <tr>
                <td>width: 100%</td>
                <td><code>w-100 </code></td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
