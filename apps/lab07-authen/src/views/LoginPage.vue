<template>
  <ion-page>
    <ion-content class="login-content" fullscreen>
      <ion-grid class="login-wrapper">
        <ion-row class="ion-justify-content-center ion-align-items-center">
          <ion-col size="12" size-md="6" size-lg="4">
            <div class="login-header">
              <h1>Welcome Back 👋</h1>
              <p>Please login to continue</p>
            </div>

            <ion-card class="login-card">
              <ion-card-content>
                <!-- Email -->
                <ion-item class="input-item">
                  <ion-input
                    v-model="email"
                    label="Email"
                    label-placement="floating"
                    type="email"
                  />
                </ion-item>

                <!-- Password -->
                <ion-item class="input-item">
                  <ion-input
                    v-model="password"
                    label="Password"
                    label-placement="floating"
                    type="password"
                  />
                </ion-item>

                <ion-button expand="block" class="btn-primary" @click="loginEmail">
                  Login with Email
                </ion-button>

                <div class="divider">OR</div>

                <ion-button
                  expand="block"
                  fill="outline"
                  color="danger"
                  @click="loginGoogle"
                >
                  Login with Google
                </ion-button>

                <!-- Phone -->
                <ion-item class="input-item">
                  <ion-input
                    v-model="phone"
                    label="Phone (081xxx or +66...)"
                    label-placement="floating"
                  />
                </ion-item>

                <ion-button
                  expand="block"
                  color="tertiary"
                  @click="loginPhone"
                >
                  Login by Phone
                </ion-button>

                <!-- ⭐ REQUIRED FOR WEB PHONE AUTH -->
                <div id="recaptcha-container"></div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/auth/auth-service";

import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
} from "@ionic/vue";

const router = useRouter();

const email = ref("");
const password = ref("");
const phone = ref("");

// ✅ Email
const loginEmail = async () => {
  try {
    const cleanEmail = email.value.trim();

    if (!cleanEmail.includes("@")) {
      alert("Invalid email format");
      return;
    }

    await authService.loginWithEmailPassword({
      email: cleanEmail,
      password: password.value,
    });

    router.replace("/tabs/tab1");
  } catch (err) {
    console.error(err);
    alert("Login failed");
  }
};

// ✅ Google
const loginGoogle = async () => {
  try {
    await authService.loginWithGoogle();
    router.replace("/tabs/tab1");
  } catch (err) {
    console.error(err);
    alert("Google login failed");
  }
};

// ✅ Phone (auto +66)
const loginPhone = async () => {
  try {
    let phoneClean = phone.value.trim();

    // auto convert Thai number
    if (phoneClean.startsWith("0")) {
      phoneClean = "+66" + phoneClean.substring(1);
    }

    if (!phoneClean.startsWith("+")) {
      alert("Phone must be international format");
      return;
    }

    const result = await authService.startPhoneLogin({
      phoneNumberE164: phoneClean,
    });

    const code = prompt("Enter OTP:");
    if (!code) return;

    await authService.confirmPhoneCode({
      verificationId: result.verificationId,
      verificationCode: code,
    });

    router.replace("/tabs/tab1");
  } catch (err: any) {
    console.error("PHONE ERROR =", err);
    alert(err?.message || "Phone login failed");
  }
};
</script>

<style scoped>
.login-content {
  --background: linear-gradient(135deg, #667eea, #764ba2);
}

.login-wrapper {
  min-height: 100%;
  padding: 20px 16px;
}

.login-header {
  text-align: center;
  color: white;
  margin-bottom: 24px;
}

.login-card {
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.input-item {
  --border-radius: 12px;
  margin-bottom: 14px;
}

.divider {
  text-align: center;
  margin: 16px 0;
  font-size: 12px;
  color: #999;
  font-weight: 600;
}
</style>
