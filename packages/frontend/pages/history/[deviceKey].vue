<!-- deviceKey.vue -- management of device
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
    Page will be the forum where users can keep track of the provenance of
    their items.
    -->

<script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router';
  const route = useRoute()
  const recordKey = route.params.deviceKey as string;
  const qrCodeUrl = `${useRuntimeConfig().public.frontendUrl}/history/${recordKey}`;

</script>

<template>
  <!-- This link is for the icon in mobile dropdown menu -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <div v-if="!isLoading">
    <div v-if="recordKeyFound">

      <div class="row pt-3 pb-6 mx-4">
        <div class="col-md-2 d-none d-md-block">
        <!-- Scrollspy -->
         <!-- When the screen size is md (>= 768px) and up  -->
            <nav id="jump-to test" class="sticky-top text-slate"> 
              <p class="menu-spacing">Jump to section</p>
              <ul id="nav" class="nav flex-column nav-pills menu-sidebar ps-2 ">
                <li id="item" class="py-2"
                  style= "border-left: 2px solid #4e3681;"
                  v-for="header in headers"
                  :key="header"
                  :class="{ active: header.id === currentSection }">
                  <a :href="'#' + header.id" class="text-slate py-2" id="item-link">{{ header.name }}</a>
                </li>
              </ul>
            </nav>
          </div>

          <!-- When the screen size is less than md (< 768px ) -->
          <div class="dropdown d-md-none" style="border-bottom: 2px solid #4e3681;">
            <button class="btn text-left rounded-0" 
                    type="button" id="jump-to-mobile" data-bs-toggle="dropdown" aria-controls="toggle" aria-expanded="false"
                    style="border: none; font-size: 18px; text-align: left; border-bottom: 3px;"> 
              <i id="toggle-right" class="fa fa-angle-right"></i>
              <i id="toggle-down" class="fa fa-angle-down"></i>
              Jump to section
            </button>

            <ul class="dropdown-menu rounded-0 border-0" style="width:95%; padding: 7px 34px; 
                background-color:#F1F5F9" aria-labelledby="dropdownMenuButton">
              <li id="dropdown-item" style="padding: 7px"
                  v-for="header in headers"
                  :key="header">
                <a :href="'#' + header.id" class="text-slate py-2" id="item-link">{{ header.name }}</a>
              </li>
            </ul>
          </div>


    <!-- Scrollspy -->

        <div class="col-md-10">
          <!-- Spied element -->
          <div  data-mdb-scrollspy-init data-spy="scroll" data-mdb-target="#jump-to" data-mdb-offset="0" class="left-col" >
            <section id="device-details">
              <div class="my-4 text-iris fs-1">
                <p class="text-bold mb-0">Asset History Records</p>
                <h1 class="mt-1 mb-1 text-iris">
                  {{ deviceRecord?.deviceName }}
                </h1>
              </div>
              <div class="qr-code-container">
                <div class="qr-code-wrapper">
                  <QRCode :url="qrCodeUrl" ref="qrcode_component" style="border-radius: 15px; overflow: hidden;"/>
                </div>
                <div class="wrapper-download">
                  <button class="btn mt-0 bg-sky px-5 p-3" @click="downloadQRCode">Download QR Code</button>
                </div>
              </div>
              <div>Record Key: {{ _recordKey }}</div>
              <div>
                  <span v-html="clickableLink(deviceRecord?.description)"></span>
              </div>
          </section>
            <section ref= "section" id="priority-notices">
              <ProvenancePriorityNotices :recordKey="_recordKey" :provenance="provenance"/>
            </section>

            <section id="recent">
              <ProvenanceFeed :recordKey="_recordKey" :provenance="provenanceNoRecord"/>
            </section>
            <section id="device-creation">
              <ProvenanceFeed :recordKey="_recordKey" :provenance="deviceCreationRecord"/>
            </section>
            <section id="create-record">
              <ProvenanceCreateRecord :deviceRecord="deviceRecord" :recordKey="_recordKey"/>
            </section>
            <section id="child-keys">
              <div v-if="hasReportingKey"> Reporting Key:
                <div> <a :href="`/history/${deviceRecord?.reportingKey}`">{{deviceRecord?.reportingKey}}</a></div>
              </div>
              <div v-if="(childKeys?.length > 0) || hasReportingKey ">
                <div> Child Keys:
                  <div> <KeyList v-bind:keys="childKeys"/> </div>
                </div>    
                <CsvFile :recordKey="_recordKey"></CsvFile>
              </div>
            </section>
            
          </div>
          <!-- Spied element -->
        </div>

      </div>

      <!-- TODO: Uncomment when  functionality is ready: 
      <div>
          <ProvenanceNotificationSignUpModal/>
      </div>   --> 
      
    </div>
    <div v-else>
      <p>Record key not found.</p>
    </div>
  </div>
  <div v-else>
      <p>Loading... please wait.</p>
    </div>
</template>

<script lang="ts">
import { getProvenance} from '~/services/azureFuncs';
import { ref } from 'vue'
import KeyList from '~/components/KeyList.vue';

let deviceRecord, provenance, deviceCreationRecord, provenanceNoRecord;
const currentSection = ref();
let section = ref();

const headers = [
  { id: "device-details", name: "Record details" },
  { id: "priority-notices", name: "Priority notices" },
  { id: "recent", name: "Most recent updates" },
  { id: "device-creation", name: "Record creation" },
  { id: "create-record", name: "Create new record entry" }
];


export default {
  components: {
    KeyList,
  },
  data() {
    return {
      isLoading: true,
      recordKeyFound: false,
      hasReportingKey: false,
      childKeys: [] as string[],
      _recordKey: "",
    }},
    async mounted() {
      try {
        this.addScrollListener();

        EventBus.on('feedRefresh', this.refreshFeed);
        
        this.refreshFeed();
      } catch (error) {
          this.isLoading = false;
          this.recordKeyFound = false;
          this.hasReportingKey = false;
          console.log(error)
      }
    },
    beforeDestroy() {
        EventBus.off('feedRefresh', this.refreshFeed);
    },
    methods: {
      downloadQRCode() {
            const qrCodeComponent = this.$refs.qrcode_component as any;
            qrCodeComponent?.downloadQRCode()
        },
      addScrollListener() {
        // When user scrolls, the nav bar is updated
        window.addEventListener('scroll', () => {
          for(let num in headers) {
            let current_id = headers[num].id;
            let sec = document.getElementById(current_id);

            let top = window.scrollY;
            let offset = sec.offsetTop + 150; // can customize how far from the section to become active
            let height = sec.offsetHeight;
            if (top >= offset && top < offset + height) {
              currentSection.value = current_id;
            }
          }
        });
      },
      async refreshFeed() {
        console.log("Refreshing feed...");
        this.isLoading = true;
        this.recordKeyFound = false;
        this.hasReportingKey = false;

        const route = useRoute();
        this._recordKey = route.params.deviceKey as string;
        const provenance = await getProvenance(this._recordKey);

        if (!provenance || provenance.length === 0) {
          this.$snackbar.add({
            type: 'error',
            text: 'No provenance record found'
          });
          this.isLoading = false;
          return;
        }

        this.recordKeyFound = true;

        // Decompose the provenance records into parts to be rendered.
        ({ provenanceNoRecord, deviceCreationRecord, deviceRecord } = decomposeProvenance(provenance));
        
        this.isLoading = false;
        
        // This functionality could be pushed into a component...
        this.hasReportingKey = (deviceRecord.reportingKey ? true : false);
        
        // We will remove the reportingKey, because although it is a child,
        // we have already rendered it.
        if (this.hasReportingKey) {
            const index = deviceRecord.children_key.indexOf(deviceRecord.reportingKey, 0);
            if (index > -1) {
                deviceRecord.children_key.splice(index, 1);
            }
        }
        this.childKeys = getChildKeys(provenance);

        // Add child key navigation if there are child keys
        if ((this.childKeys?.length > 0) || this.hasReportingKey) {
          headers.push({ id: "child-keys", name: "Child keys" });
        }
      },
    }
};

</script>
<style>
#device-details {
    margin: 20px auto;
    position: relative;
}

.qr-code-wrapper {
  background-color:#4e3681; /* Light blue background */
  padding:13px;
  padding-bottom: 7px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform:scale(0.775);
  margin: -20px;
  transition-duration: 0.4s;
}
.qr-code-wrapper:hover {
  transform: scale(0.825);
}
.qr-code-container {
  margin-top: -110px;
  margin-right: 15px;
  display: inline-block;
  background-color: rgb(238, 247, 255); /* Light blue background */
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  position:absolute;
  right: 0;
  transform:scale(1.1);
  /* transform-origin: top right; */
}
.wrapper-download {
  padding: 0;
  text-align: center;
  padding-bottom: 15px;
  transform: scale(0.95);
  margin-top: -30px;
  transition-duration: 0.4s;
}
.wrapper-download:hover {
  transform: scale(1);
}
.download-button {
    display: inline-block;
    margin-top: 15px;
    padding: 10px 20px;
    color: #333;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    text-decoration: none;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.download-button:hover {
    background-color:#4e3681; /* Slightly darker blue on hover */
}

.menu-spacing {
  padding-top: 34px;
}

.provenance {
  white-space: pre-line;
}

a:link, a:visited {
      text-decoration: none;
}

#item > a {
  padding-left: 20px;
  box-decoration-break: clone;
}


#item > a:hover {
  padding-left: 20px;
  font-weight: bold;
}

.active > a {
  border-left: 3px solid #4e3681;
  padding-left: 20px;
  font-weight: bold;
}

#dropdown-item > a:hover {
  font-weight: bold;
}

#jump-to-mobile[aria-expanded="true"] {
  #toggle-down {
    display:inline-block;
  }
  #toggle-right {
    display: none;
  }
}

#jump-to-mobile[aria-expanded="false"] {
  #toggle-down {
    display:none;
  }
  #toggle-right {
    display: inline-block;
  }
}


</style>
