<template>
    <div class="root-div">

        <!-- Mobile Menu -->
        <nav class="navbar navbar-expand-lg bg-frost">
            <div class="container-fluid" id="nav">
                <a href="/" class="navbar-brand" >
                    <img src="../assets/styles/gosqas_logo.png" id="logo">
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav"
                    aria-controls="main-nav" aria-expanded="false" aria-label="Toggle navigation" id="button-toggler">
                    <span class="navbar-toggler-icon" id="menu-icon"></span>
                    <span class="close-icon" id="close-icon"><svg xmlns="http://www.w3.org/2000/svg" width="25.5px" height="19.5px" fill="currentColor" class="bi bi-x-lg" >
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                      </svg></span>
                </button>
                <div class="collapse navbar-collapse flex-column" id="main-nav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item mobile-nav">
                            <RouterLink to="/" class="nav-link">Home</RouterLink>
                        </li>
                        <li class="nav-item">
                            <RouterLink to="/about" class="nav-link">About</RouterLink>
                        </li>
                        <li class="nav-item">
                            <RouterLink to="/how-it-works" class="nav-link">How it Works</RouterLink>
                        </li>
                        <li class="nav-item">
                            <RouterLink to="/data-privacy" class="nav-link">Data & Privacy</RouterLink>
                        </li>
                        <div class="mobile-nav">
                            <li style="margin:10px 0px">
                                <a class="mobile-link" href="https://github.com/gosqasorg/asset-provenance-tracking">GDT GitHub</a>
                            </li>
                            <li class="button-spacing" style="margin:20px 0px 0px 0px">
                                <RouterLink to="/terms_and_conditions" class="mobile-link">Terms and Conditions</RouterLink>
                            </li>
                        </div>
                        <span>
                            <ButtonComponent @click="trackingForm()" id="viewRecordButton" buttonText="View Record" padding="12px 16px" margin="0px 20px 0px 0px" style="font-size: 18px"></ButtonComponent>
                            <RouterLink to="/gdt"><ButtonComponent class="mobile-nav" buttonText="Create Record" backgroundColor="#e6f6ff" color="#4e3681" padding="12px 16px" margin="20px 0px 0px 0px" style="font-size: 18px"></ButtonComponent></RouterLink>
                        </span>
                    </ul>
                    <div class="me-0 ms-auto" id="viewRecordDiv" style="display:none;">
                        <TrackAsset inputWidth="75%" id="viewRecordInput"></TrackAsset>
                    </div>
                </div>
            </div>
        </nav>

        <div class="content">
            <slot/>
        </div>

        <!-- Footer Section -->
        <footer class="footer footer-light bg-frost">
            <div class="container custom-row-position custom-container">
                <div class="col-md-5 text-md-start mb-3 mb-md-0 custom-logo">
                    <RouterLink to="/">
                        <img src="../assets/styles/gosqas_logo.png" height="42px" alt="Global Open Source Quality Assurance System">
                    </RouterLink>
                </div>
                <div class="row col-md-4 text-md-start">
                    <div class="col-md-3">
                        <div class="row">
                            <RouterLink to="/" class="me-3">Home</RouterLink>
                            <RouterLink to="/how-it-works" class="me-3">How It Works</RouterLink>
                            <a href="https://github.com/gosqasorg/asset-provenance-tracking" class="me-3">GDT GitHub</a>
                        </div>
                    </div>
                    <div class="col-md-2 text-md-start custom-row-about">
                        <div class="row">
                            <RouterLink to="/about" class="me-3">About</RouterLink>
                            <RouterLink to="/data-privacy" class="me-3">Data & Privacy</RouterLink>
                            <RouterLink to="/terms_and_conditions" class="me-3">Terms and Conditions</RouterLink>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row custom-copy-right">
                <p class="text-muted">© 2024 Global Open Source Quality Assurance System</p> 
            </div>
        </footer>

    </div>
</template>

 
 

<script lang="ts">
let showTrack = false;

export default {
    methods: {
        // Function to have the 'View Record' input field appear
        async trackingForm() {
            let viewRecordDiv = <HTMLDivElement>document.getElementById("viewRecordDiv");
            let viewRecordButton = <HTMLDivElement>document.getElementById("viewRecordButton");
            let nav = <HTMLDivElement>document.getElementById("nav")

            if (!showTrack) { //if showTrack is false
                showTrack = true;
                viewRecordDiv.style.display="inline"; //make text input available
                viewRecordButton.style.backgroundColor = "#322253";
                viewRecordButton.style.borderColor = "#322253";
                nav.style.paddingBottom = "80px";

            } else { 
                showTrack = false; 
                viewRecordDiv.style.display="none";
                viewRecordButton.style.backgroundColor = "#4E3681";
                viewRecordButton.style.borderColor = "#4E3681";
                nav.style.paddingBottom = "24.5px";

            }
        },
    }
}

</script>


 
<style scoped>
    .root-div {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    .content {
        flex: 1 0 auto;
    }

    .navbar-collapse {
        top: 0;
        left: 0;
        right: 0;
        z-index: 2; /* This is 2 because the LargeTogle.vue is 1 */
    }

    .navbar-toggler:focus {
        outline: none;
        box-shadow: none;
    }

    .navbar .container-fluid {
        display: flex;
        align-items: center; /* Aligns navbar content vertically */
    }

    .navbar-brand {
        z-index: 3;
    }

    .navbar-toggler,
    .navbar-toggler:focus,
    .navbar-toggler:active,
    .navbar-toggler-icon:focus {
        border: none;
        box-shadow: none;
    }

    .navbar-collapse .nav-link:hover,
    .navbar-collapse .nav-link.active,
    .mobile-link:hover,
    .mobile-link.active {
        color: #4e3681;
        font-weight: 600;
    }

    #button-toggler {
        width: 100%;
        max-width: 8vw;
        height: auto;
    }

    #button-toggler[aria-expanded='true'] {
        #menu-icon {
            display: none;
        }
        #close-icon {
            display: inline-block;
        }
    }

    #button-toggler[aria-expanded='false'] {
        #menu-icon {
            display: inline-block;
        }
        #close-icon {
            display: none;
        }
    }

    /* For screens less than 992px*/
    /* This number differs from our traditional 768px because the nav bar
        list options look too cluttered in medium screens*/
    @media (max-width: 992px) {
        .mobile-nav {
            display: inline-block;
        }
        .container-fluid {
            padding:28px 30px;
        }
        li .mobile-link{
            padding: 30px 0;
        }
        .navbar-collapse.show {
            transition: all 0.5s;
            height: 100vh;  
        }
        .navbar-collapse {
            padding-top: 20px;
            padding-left: 6px; /* plus 30px padding from container fluid = 36px*/
        }
        .nav-link {
            font-size: 32px;
            font-weight: 600;  
            color: #1E2019;
        }
        .mobile-link {
            font-size: 28px;
            font-weight: 500;
            color: #1E2019;
            text-decoration: none;
        }
        #viewRecordInput {
            padding-right: 0px;            
        }
        #nav {
            padding-bottom: 24.5px !important;
        }
        
        /* Make footer wrap */
        .container { flex-wrap: wrap;  }
        .custom-logo { flex-basis: 100%; }
    
    }

    .container {
        display: flex;
    }


    /* For screens bigger than 992px*/
    @media (min-width: 992px) {
        .mobile-nav {
            display: none;
        }
        .container-fluid {
            padding:24.5px 40px;
            position: relative;
        }
        #main-nav{
            position:absolute;
            padding:24.5px 20px;  /* right margin is 40 but View Record button has a 20px margin */
        }
        .nav-link {
            font-size: 20px;
            font-weight: 400;        
            color: #1E2019;
        }
        li {
            align-content: center;
            margin-right: 15px; /* Need a smaller margin so it does not collide with logo */
        }   

        #viewRecordDiv {
            min-width: 600px;
        }

        #viewRecordInput {
            padding-right: 20px;
        }
    }


    /* Footer Styling */
    @media (max-width:420px) {
        .custom-row-home, .custom-row-about {
            display: none; /* Hide the sections */
        }
        .text-muted {
            font-size: 7px; /* Smaller font size for the copyright text */
        }
        .custom-nav { /* mobile view */
            padding: 0px 7px 0px 20px;
            height: 101px;
        }

        /* Adjust mobile menu logo spacing when size is below 420px */
        #logo {
            width: 100%;
            max-width: 58vw;
            height: auto;
        }

        /* Change box sizes for the footer */
        .col-md-4 {
            width: 200px !important;
        }

        .col-md-5 {
            margin-right: 5px !important;
        }

        .footer {
            padding: 30px !important;
        }
    }

    @media (min-width: 420px) {
        #logo {
            width: 100%;
            max-width: 25vw;
            min-width: 262px;
            height: auto;
        }
    }

    @media (min-width: 768px) { /* desktop view */
        .custom-nav {
            padding: 0px 30px 0px 30px;
            height: 101px;
        }
    }

    @media (max-width: 370px) {
        /* Shrink the footer logo */
        .custom-logo img {
            max-width: 85%;
            height: auto;
        }
    }

    .footer {
        width: 100%;
        padding: 40px;
        padding-bottom: 0px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        flex-shrink: 0;
    }


    .footer a {
        color: #333;
        text-decoration: none;
    }


    .footer p {
        margin: 0;
        color: #666;
    }

    /* Shift the row slightly to the left */
    .custom-container {
        padding: 0px; /* Remove padding to move content closer to the side edges */
        margin-left: -15px;/* Adjust the padding to move the content more to the left */
        text-align: left; /* Ensure the content is left-aligned */
        margin: 0px;
        position: relative;

        /* display: grid;
        column-gap: 30px; */

        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        max-width: 100%;
    }

    .custom-logo {
        flex: 2;
        box-sizing: border-box;
    }

    .custom-row-home {
        position: relative;
        box-sizing: border-box;
        flex: 1;
        /*left: 160px; /* Move it to the right by 20px, adjust as necessary */
        /* width: 250px; */
    }

    .custom-row-about {
        position: relative;
        box-sizing: border-box;
        flex: 1;
        /*left: 24%; /* Move it to the right by 20px, adjust as necessary */
        display: inline-block;
        /*width: 250px;*/
    }

    /* Logo */
    .col-md-5 {
        float: left;
        width: 50%;
        padding: 10px;
        margin-right: 20px;
        /* width: min-content; */
        flex: 2 1 auto;  /* flex-grow, flex-shrink, flex-basis */
    }

    /* Links container */
    .col-md-4 {
        float: left;
        width: 300px;
        padding: 10px;
        padding-top: 0px;

        /* width: max-content; */
        flex: 1 0 auto;  /* flex-grow, flex-shrink, flex-basis */
    }

    /* First col of links */
    .col-md-3 {
        padding: 10px;
        width: 45%;
        /* white-space: nowrap; */

        /* width: max-content; */
    }

    /* Second col of links */
    .col-md-2 {
        padding: 10px;
        width: 55%;
        /* white-space: nowrap; */

        /* width: max-content; */
    }

    .custom-copy-right {
        margin-left: auto;
        margin-right: auto;
        text-align: center;
        margin-top: 50px;
        margin-bottom: 25px;
    }


    /* Smaller copyright text */
    .text-muted {
        font-size: 16px; /* Smaller font size for the copyright text */
        font-weight: 400;
        line-height: 24px;
    }

    @media (max-width: 398px) {
        .button-spacing {
            padding-bottom: 20px;
        }
    }


</style>
