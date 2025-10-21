<script lang="ts" setup>
import { Avatar2, Avatar3, Avatar4 } from "@/assets/images/users/utils";
</script>
<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Example">
        <v-card-text>
          <div class="text-muted mb-4">
            Use few flex utilities that allow even more flexibility and
            customization than before.
          </div>
          <div class="d-flex">
            <v-avatar class="me-3" :image="Avatar2" rounded size="50" />
            <div>
              <div class="text-subtitle-2 font-weight-bold mb-1">
                Media heading
              </div>
              <div class="text-muted">
                This is some content from a media component. You can replace
                this with any content and adjust it as needed.
              </div>
            </div>
          </div>
          <div class="d-flex mt-8 justify-space-between">
            <div>
              <div class="text-subtitle-2 font-weight-bold mb-1">
                Media heading
              </div>
              <div class="text-muted">
                This is some content from a media component. You can replace
                this with any content and adjust it as needed.
              </div>
            </div>
            <v-avatar class="me-3" :image="Avatar3" rounded size="50" />
          </div>
          <div class="d-flex mt-8">
            <v-avatar class="me-3" :image="Avatar4" rounded size="50" />
            <div>
              <div class="text-subtitle-2 font-weight-bold mb-1">
                Media heading
              </div>
              <div class="text-muted">
                This is some content from a media component. You can replace
                this with any content and adjust it as needed.
              </div>
            </div>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Nesting Example">
        <v-card-text>
          <div class="text-muted mb-4">
            Use few flex utilities that allow even more flexibility and
            customization than before. and put nested item into the dive of
            parent div.
          </div>
          <div class="d-flex">
            <v-avatar class="me-3" :image="Avatar2" rounded size="50" />
            <div>
              <div class="text-subtitle-2 font-weight-bold mb-1">
                Media heading
              </div>
              <div class="text-muted">
                This is some content from a media component. You can replace
                this with any content and adjust it as needed.
              </div>

              <div class="d-flex mt-8">
                <v-avatar class="me-3" :image="Avatar3" rounded size="50" />

                <div>
                  <div class="text-subtitle-2 font-weight-bold mb-1">
                    Media heading
                  </div>
                  <div class="text-muted">
                    This is some content from a media component. You can replace
                    this with any content and adjust it as needed.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex mt-8">
            <v-avatar class="me-3" :image="Avatar4" rounded size="50" />
            <div>
              <div class="text-subtitle-2 font-weight-bold mb-1">
                Media heading
              </div>
              <div class="text-muted">
                This is some content from a media component. You can replace
                this with any content and adjust it as needed.
              </div>
            </div>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12">
      <Card title="Media Alignment">
        <v-card-text>
          <div class="text-muted mb-4">
            Use few flex utility <code>d-flex</code> including alignment options
            like, <code> start</code>, <code>center</code> and <code>end</code>.
          </div>

          <div class="d-flex">
            <v-avatar class="me-3" :image="Avatar2" rounded size="50" />
            <div>
              <div class="text-subtitle-2 font-weight-bold mb-1">
                Media heading
              </div>
              <div class="text-muted">
                <p>
                  Cras sit amet nibh libero, in gravida nulla. Nulla vel metus
                  scelerisque ante sollicitudin. Cras purus odio, vestibulum in
                  vulputate at, tempus viverra turpis. Fusce condimentum nunc ac
                  nisi vulputate fringilla. Donec lacinia congue felis in
                  faucibus.
                </p>
                <p class="mt-1">
                  Donec sed odio dui. Nullam quis risus eget urna mollis ornare
                  vel eu leo. Cum sociis natoque penatibus et magnis dis
                  parturient montes, nascetur ridiculus mus.
                </p>
              </div>
            </div>
          </div>
          <div class="d-flex mt-8 align-center">
            <v-avatar class="me-3" :image="Avatar3" rounded size="50" />

            <div>
              <div class="text-subtitle-2 font-weight-bold mb-1">
                Media heading
              </div>
              <div class="text-muted">
                <p>
                  Cras sit amet nibh libero, in gravida nulla. Nulla vel metus
                  scelerisque ante sollicitudin. Cras purus odio, vestibulum in
                  vulputate at, tempus viverra turpis. Fusce condimentum nunc ac
                  nisi vulputate fringilla. Donec lacinia congue felis in
                  faucibus.
                </p>
                <p class="mt-1">
                  Donec sed odio dui. Nullam quis risus eget urna mollis ornare
                  vel eu leo. Cum sociis natoque penatibus et magnis dis
                  parturient montes, nascetur ridiculus mus.
                </p>
              </div>
            </div>
          </div>
          <div class="d-flex mt-8 align-end">
            <v-avatar class="me-3" :image="Avatar4" rounded size="50" />
            <div>
              <div class="text-subtitle-2 font-weight-bold mb-1">
                Media heading
              </div>
              <div class="text-muted">
                <p>
                  Cras sit amet nibh libero, in gravida nulla. Nulla vel metus
                  scelerisque ante sollicitudin. Cras purus odio, vestibulum in
                  vulputate at, tempus viverra turpis. Fusce condimentum nunc ac
                  nisi vulputate fringilla. Donec lacinia congue felis in
                  faucibus.
                </p>
                <p class="mt-1">
                  Donec sed odio dui. Nullam quis risus eget urna mollis ornare
                  vel eu leo. Cum sociis natoque penatibus et magnis dis
                  parturient montes, nascetur ridiculus mus.
                </p>
              </div>
            </div>
          </div>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
