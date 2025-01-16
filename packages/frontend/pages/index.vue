<!-- index.vue
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
    This is the home page for GOSQAS
-->
<script setup lang="ts">
    const route = useRoute()
</script>

<template>
    <div class="container-fluid">

        <div class="row" id="first-row">
            <div class="col-12 col-md-7" id="first-row-col">
                <div class="row"> <h1>Trust and transparency when you need it most.</h1> </div>
                <div class="row"> <h4>Explore Global Distributed Tracking (GDT), our open source software enabling closed-loop tracking for products, information, and logistics.</h4> </div>
                <div class="row" style="margin-top:20px; display:inline-flex">
                    <form id="viewRecordButton" style="margin-right: 8px; width:40%; width: 190px; padding-right: 0px;" @submit.prevent="trackingForm">
                        <button-component class="button" id="homeTrackButton" buttonText="View Record" type="submit" style="opacity:100;"
                            padding="18px 22px"></button-component>
                    </form>
                    <div id="createRecordButton" style="width: 60%; width: 230px;" >
                        <RouterLink to="/gdt"><button-component class="button" id="homeCreateButton" buttonText="Create Record" backgroundColor="#CCECFD"
                            borderColor="#CCECFD" color="#1E2019" padding="18px 22px" margin="0px 0px 0px 0px"></button-component></RouterLink>
                    </div>
                    <div id="homeTrackAssetDiv" style="visibility: hidden; height: 0px; padding-bottom: 20px;">
                        <TrackAsset inputWidth="75%"></TrackAsset>
                    </div>
                </div>
                
            </div>

        </div>

        <div class="row bg-frost" id="second-row" >
            <div class="row rowtest">
                <div class="col wrap-word" id="second-row-cols" v-for="item in second_row">
                    <h3 class="text-iris" id="second-row-cols-h3">{{item.title}}</h3>
                    <p class="text-eggplant" style="font-weight: 400;">{{ item.descr }}</p>         
                </div>
            </div>
            <div class="col" style="text-align: center; margin-top: 50px;">
                <RouterLink to="/about"><button-component class="button" buttonText="About Us" color="#322253" backgroundColor="#ffffff00"></button-component></RouterLink>
            </div>

        </div> 

        <Learn_more id="learn-more"></Learn_more>

    </div>

</template>



<script lang="ts">
import Learn_more from '~/layouts/learn_more.vue';
import ButtonComponent from '~/components/ButtonComponent.vue';
let showTrack = false;

const second_row = [
    { title: "Simplicity & Accessibility", descr: "We believe that open-source projects should be simple to use and understand."},
    { title: "Data Ownership", descr: "We do not have access to any user data, ensuring complete privacy and independent ownership."},
    { title: "Open Source", descr:"Our projects are created for the public good and are available free of charge."}
];

export default {
    methods: {
        // Function to have the 'Track an asset' input field appear
        async trackingForm() {
            let trackAssetDiv = <HTMLDivElement>document.getElementById("homeTrackAssetDiv");
            let trackButton = <HTMLDivElement>document.getElementById("homeTrackButton");

            if (!showTrack) { //if showTrack is false
                showTrack = true;
                trackAssetDiv.style.visibility="visible"; //make text input available
                trackButton.style.backgroundColor = "#322253";
                trackButton.style.borderColor = "#322253";
                trackAssetDiv.style.height = "auto";

                // trackAssetDiv.style.paddingTop = "20px";

            } else { 
                showTrack = false; 
                trackAssetDiv.style.visibility="hidden";
                trackButton.style.backgroundColor = "#4E3681";
                trackButton.style.borderColor = "#4E3681";
                trackAssetDiv.style.height = "0px";

                // trackAssetDiv.style.paddingTop = "0px";
            }
        },
    }
}

</script>


<style scoped>

#wrap-word {
    overflow-wrap: break-word;
}

#rowtest {
    width: 100%;
    max-width: 20vw;
    height: auto;
}

#first-row {
    /* Set the hand background image on the homepage */
    background-image: url(../assets/images/hand-icon.png);
    background-repeat: no-repeat;
    background-position-x: 85%;
    background-position-y: bottom;
    background-size: 60%;

    height: auto;
    display: flex;  
    flex-wrap: wrap;
}

/* For screens less than 991px resize hand logo*/
@media (max-width: 991px) {
    #first-row {
        background-size: 50% !important;
        height: auto;
    }
    h1 {
        font-size: 32px !important;
        line-height: 50px !important;
    }
    /* Remove extra padding on the right of the top white box */
    #first-row-col {
        width: 100% !important;
    }
}

/* For screens less than 768px */
@media (max-width: 768px) {
    #first-row-col{
        padding: 41px 33px 80px 33px;
    }
    #second-row{
        padding: 40px 30px;
    }
    #second-row-cols{
        gap: 20px;
    }
    #second-row-cols-h3 {
        font-weight: 600;
    }
    #learn-more{
        padding: 40px 30px;
    }
    .button{
        font-size: 18px;
    }
    #first-row {
        background-size: 60% !important;
    }
    #viewRecordButton {
        margin-right: 5px !important;
        width: 180px !important;
    }
    #createRecordButton {
        order: 1; 
    }
}

/* For screens less than 381px resize hand logo */
@media (max-width: 381px) {
    #first-row {
        background-size: 90% !important;
        background-position-x: 95%;
    }
}

/* For screens greater than 768px */
@media (min-width: 768px) {
    #first-row-col{
        padding: 60px 78px;
    }
    #second-row {
        padding: 70px 100px;
    }
    #second-row-cols{
        gap: 40px;
    }
    #learn-more{
        padding: 70px 100px;
    }
    .button{
        font-size: 20px;
        padding: 1px;
        
    }

}

@media (max-width: 1083px) {
    #first-row {
        background-size: 70%;
    }
}


</style>
