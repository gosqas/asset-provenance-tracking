<!-- donate.vue
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
<!--
    This is the Donation page for GOSQAS
-->
<script setup lang="ts">
    const route = useRoute()
</script>


<template>
    <div class="container-fluid" id="donate-container">
        <h1 class="text-iris">Support GOSQAS</h1>
        <div class="row">
            <p style="font-weight: 400; margin-bottom: 30px;" > The Global Open Source Quality Assurance System (GOSQAS) 
                creates opportunities for better practices across the diverse humanitarian response, open-source hardware, 
                and scientific research communities. We employ open-source tools and principles to centralize user solutions, 
                despite location or resource environment.</p>
        </div>
        
        <form class="mt-3 mb-5" action="https://www.paypal.com/donate" method="post" target="_top">
            <input type="hidden" name="hosted_button_id" value="L4XU6TL2UYSA2" />
            <input type="submit" class="donate-btn" value="Make a Donation on Paypal" />
        </form>

        <div class="row">
            <h3 class="text-iris involved-heading">Get Involved!</h3>

            <!-- TODO: update with link to open positions once we have it -->
            <p>Interested in helping out? Email us at <span class="learn-more-desc text-decoration-underline text-iris"> gosqasystem@gmail.com</span>
                or view our open positions.</p>
        </div>

        <div class="row">
            <div class="col wrap-word">
                <RouterLink to="/about" class="text-iris heading-link">About Us</RouterLink>
                <p>Read our mission statement and discover our values.</p>
            </div>
            <div class="col wrap-word">
                <RouterLink to="/how-it-works" class="text-iris heading-link">How it Works</RouterLink>
                <p>Learn about our open-source methodology.</p>
            </div>
            <!-- TODO: replace text and link once FIGMA is updated -->
            <div class="col wrap-word">
                <RouterLink to="/donate" class="text-iris heading-link">Another Thing</RouterLink>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
import ButtonComponent from '~/components/ButtonComponent.vue';

export default {
    components: {
        ButtonComponent
    }
};
</script>

<style scoped>
.involved-heading {
    font-size: 32px !important;
}

.heading-link {
    font-size: 24px;
}

.box {
    float:left;
    width: 33.33%;
}

.donate-btn {
    font-size: 18px;
    font-weight: 400;
    line-height: 31px;

    background-color: #4e3681;
    border: #4e3681;
    color: white;
    padding: 10px 20px;
    border-radius: 10px;

    display: block;
    width: 100%;
    white-space: normal;
}

@media (min-width: 768px) {
   .donate-btn {
        font-size: 20px;
        font-weight: 400;
        line-height: 34px;
   }
}

/* For screens smaller than 768px */
@media (max-width: 768px) {
    #donate-container{
        padding: 20px 20px 40px 20px;
    }
    .row{
        margin-top:32px;
    }
}

/* For screens larger than 768px */
@media (min-width: 768px) {
    #donate-container{
        padding: 80px 200px 100px 200px;
    }
    .row{
        margin-top:32px;
    }
}
</style>
