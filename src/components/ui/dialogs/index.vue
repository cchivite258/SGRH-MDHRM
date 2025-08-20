<script lang="ts" setup>
import { ref } from "vue";
const dialog = ref(false);
const dialog2 = ref(false);
const dialog3 = ref(false);
const topDialog = ref(false);
const bottomDialog = ref(false);

import { dialogContent, overflowContent } from "@/components/ui/dialogs/utils";
</script>
<template>
  <div class="text-muted mb-4">
    The <code> v-dialog</code> component inform users about a specific task and
    may contain critical information, require decisions, or involve multiple
    tasks. Use dialogs sparingly because they are interruptive.
  </div>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Default Dialog" class="h-100">
        <v-card-text>
          <div class="text-muted">
            In this basic example we use the <code>activator</code> slot to
            render a button that is used to open the dialog. When using the
            activator slot it is important that you bind the <b>props</b> object
            from the slot (using v-bind) to the element that will activate the
            dialog.
          </div>
          <v-dialog width="800">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                text="Open Dialog"
                color="primary"
                class="mt-4"
              />
            </template>

            <template #default="{ isActive }">
              <v-card title="Dialog">
                <v-card-text>
                  <div v-html="dialogContent"></div>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>

                  <v-btn
                    text="Close Dialog"
                    color="primary"
                    variant="elevated"
                    @click="isActive.value = false"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Dialog with v-model" class="h-100">
        <v-card-text>
          <div class="text-muted">
            You can also trigger a dialog by simply updating the
            <code> v-model</code>, without using either <b>activator</b> slot or
            prop. In this case, the dialog will not appear to be activated by
            any specific element, and will simply appear in the middle of the
            screen.
          </div>
          <v-btn color="primary" @click="dialog = true" class="mt-4">
            Open Dialog
          </v-btn>

          <v-dialog v-model="dialog" width="500">
            <v-card>
              <v-card-text>
                <div v-html="dialogContent"></div>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  color="primary"
                  variant="elevated"
                  block
                  @click="dialog = false"
                  >Close Dialog</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Fullscreen Dialog" class="h-100">
        <v-card-text>
          <div class="text-muted">
            USe <code>fullscreen</code> prop to make dialog fullscreen.
          </div>
          <v-btn color="primary" @click="dialog2 = true" class="mt-4">
            Open Dialog
          </v-btn>

          <v-dialog v-model="dialog2" fullscreen>
            <v-card>
              <v-card-title>
                <div class="text-subtitle-1 font-weight-bold">
                  Full screen modal
                </div>
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-card-text>
                  <div v-html="dialogContent"></div>
                </v-card-text>
              </v-card-text>
              <v-divider />
              <v-card-actions class="d-flex justify-end">
                <v-btn
                  color="primary"
                  variant="elevated"
                  @click="dialog2 = false"
                  >Close Dialog</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Dialog Transitions" class="h-100">
        <v-card-text>
          <div class="text-muted">
            You can make the dialog appear from the <b>top</b> or the
            <b>bottom</b>, by adding <code>transition</code> prop to
            <b>dialog-top-transition</b> and <b>dialog-bottom-transition</b>
          </div>
          <v-row class="mt-2">
            <v-col cols="12" lg="6">
              <v-btn color="primary" @click="bottomDialog = true"
                >Bottom Transition</v-btn
              >
              <v-btn color="primary" class="ms-1" @click="topDialog = true"
                >Top Transition</v-btn
              >
            </v-col>
          </v-row>

          <v-dialog
            v-model="topDialog"
            width="500"
            transition="dialog-top-transition"
          >
            <v-card>
              <v-card-title>Top Transition</v-card-title>
              <v-divider />
              <v-card-text>
                <div v-html="dialogContent"></div>
              </v-card-text>
              <v-divider />
              <v-card-actions class="d-flex justify-end">
                <v-btn
                  color="primary"
                  variant="elevated"
                  @click="topDialog = false"
                >
                  Close Dialog
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog
            v-model="bottomDialog"
            width="500"
            transition="dialog-bottom-transition"
          >
            <v-card>
              <v-card-title>Bottom Transition</v-card-title>
              <v-divider />
              <v-card-text>
                <div v-html="dialogContent"></div>
              </v-card-text>
              <v-divider />
              <v-card-actions class="d-flex justify-end">
                <v-btn
                  color="primary"
                  variant="elevated"
                  @click="bottomDialog = false"
                >
                  Close Dialog
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Persistent Dialog" class="h-100">
        <v-card-text>
          <div class="text-muted">
            Persistent dialogs are <code>not dismissed</code> when touching
            outside or pressing the esc key.
          </div>
          <v-dialog width="500" persistent>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                text="Open Dialog"
                color="primary"
                class="mt-4"
              />
            </template>

            <template #default="{ isActive }">
              <v-card title="Persistent Dialog">
                <v-card-text>
                  <div v-html="dialogContent"></div>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>

                  <v-btn
                    text="Close Dialog"
                    color="primary"
                    variant="elevated"
                    @click="isActive.value = false"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Overflowed Dialog" class="h-100">
        <v-card-text>
          <div class="text-muted">
            Persistent dialogs are <code>not dismissed</code> when touching
            outside or pressing the esc key.
          </div>
          <v-dialog v-model="dialog3" width="800">
            <template #activator="{ props }">
              <v-btn color="primary" v-bind="props" class="mt-4">
                Open Dialog
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">Use Google's location service?</span>
              </v-card-title>
              <v-card-text>
                {{ overflowContent }}
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="green-darken-1"
                  variant="text"
                  @click="dialog3 = false"
                >
                  Disagree
                </v-btn>
                <v-btn
                  color="green-darken-1"
                  variant="text"
                  @click="dialog3 = false"
                >
                  Agree
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
