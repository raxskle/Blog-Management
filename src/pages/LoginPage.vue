<template>
  <div class="loginWrap">
    <div class="loginBox">
      <div class="account"><input class="inputBox" type="text" placeholder="account" v-model="account"/></div>
      <div class="password"><input class="inputBox" type="password" placeholder="passward" v-model="password"/></div>
      <button class="tryloginBtn" @click="postLogin">login</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from "../network/login";

let router = useRouter();

let account = ref("");
let password = ref("");
let postLogin = async () => {
  let data = {
    account: account.value, 
    password: password.value,
  }
  let token = await login(data);
  if (!token) {
    console.log(token,"登录失败，无权限");
  } else {
    // 登录指进入admin页面，将获取到的token存到sessionStorage
    // 只有当次页面会话并且token有效期内有效
    // console.log(token)
    sessionStorage.setItem("adminToken", token);
    router.replace("/blogadmin/admin");
  }

}


</script>

<style lang="scss" scoped>

.loginWrap {
  // z-index: 3;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: rgb(192, 238, 244);
  .loginBox {
    width: 400px;
    height: 300px;
    padding-top: 20px;
    border-radius: 20px;
    flex-direction: column;
    background-color: white;

    .inputBox {
      height: 30px;
      width: 200px;
      // box-sizing: border-box;
      background-color: rgba(235, 235, 235, 0.8);
      border: 1px solid  rgba(235, 235, 235, 0.8);      
      margin: 10px;
      padding-left: 15px;
      border-radius: 15px;
      line-height: 30px;
      &:active {
        border: 1px solid black;
      }
    }
    .tryloginBtn {
        width: 100px;
        height: 40px;
        border-radius: 20px;
        margin: 10px;
        border: 1px solid rgb(61, 199, 237);
        background-color: rgb(61, 199, 237);
        &:hover {
          cursor: pointer;
        }
        &:active {
          background-color: rgb(57, 169, 200);
        }
      }
  }

}

</style>