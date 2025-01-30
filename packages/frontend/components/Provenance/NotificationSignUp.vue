<!-- 
NotificationSignUpModal.vue -- Notification System for Creation of Provenance Record  
Copyright (C) 2024 GOSQAS 
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. -->


<template>
    <div>
        <form  class="bg-frost p-3"  @submit.prevent="submitForm">
            <h4 class="text-iris">Notification Sign Up</h4>
            <div class="form-group">
                <label for="email" class="mt-3 mb-3 text-iris">Email:</label>
                <input type="email" id="email" v-model="email" required class="form-control">
            </div>
            
            <div class="form-group">
                <label for="tag" class="mt-3 mb-3 text-iris">Tag:</label>
                <input type="text" id="tag" v-model="tag" required class="form-control">
            </div>
            
            <ButtonComponent class="my-4 mb-0 submit-btn" buttonText="Sign Up" type="submit" />
        </form>
    </div>
</template>

<script>

export default {
    data() {
        return {
            email: '',
            tag: ''
        };
    },
    props: {
        recordKey: {
            type: String,
            default: "",
        },
    },
    methods: {
        // Will send tag and email data to database
        async submitForm() {
            console.log("submitting form", this.email, this.tag);
            await subscribeNotification(this.recordKey, this.email, ["subscribe", this.tag]);
        }
    }
};
</script>

<style>
  form {
      background-color: rgb(145, 193, 248);
      border-radius: 10px;
      padding: 30px;
      width: 70%;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
</style>