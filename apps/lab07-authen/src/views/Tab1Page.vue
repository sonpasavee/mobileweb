<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>User Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <ion-card v-if="user">
        <ion-card-header>
          <ion-card-title>User Info</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <p><b>UID:</b> {{ user.uid }}</p>
          <p><b>Email:</b> {{ user.email || '-' }}</p>
          <p><b>Phone:</b> {{ user.phoneNumber || '-' }}</p>
          <p><b>Name:</b> {{ user.displayName || '-' }}</p>

          <ion-button expand="block" color="medium" @click="logout">
            Logout
          </ion-button>
        </ion-card-content>
      </ion-card>

      <div v-else>Loading user...</div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { authService } from "@/auth/auth-service";
import { useRouter } from "vue-router";

const router = useRouter();
const user = ref<any>(null);

onMounted(async () => {
  user.value = await authService.getCurrentUser();
});

const logout = async () => {
  await authService.logout();
  router.replace("/login");
};
</script>
