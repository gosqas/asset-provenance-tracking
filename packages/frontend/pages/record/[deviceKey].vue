<!-- deviceKey.vue -- Adjustment for Device
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
<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import GenerateQRCode from '~/components/GenerateQRCode.vue';
import KeyList from '~/components/KeyList.vue';
import { getProvenance } from '~/services/azureFuncs';
import clickableLink from '~/utils/clickableLink';
import QRCode from '@/components/QRCode.vue';

const route = useRoute();
const recordKey = route.params.deviceKey;
const qrCodeUrl = `${useRuntimeConfig().public.frontendUrl}/history/${recordKey}`;

const isLoading = ref(true);
const hasReportingKey = ref(false);
const childKeys = ref<string[]>([]);
const loadingKey = ref(0);
const deviceRecord = ref<any>(null);
const qrcode_component = ref(null);

const forceRerender = () => {
    loadingKey.value += 1;
};

const downloadQRCode = () => {
    qrcode_component.value?.downloadQRCode();
};

const viewRecord = () => {
    navigateTo(`/history/${recordKey}`);
};

onMounted(async () => {
    try {
        const deviceKey = route.params.deviceKey as string;
        const response = await getProvenance(deviceKey);
        deviceRecord.value = response[response.length - 1].record;
        isLoading.value = false;
        hasReportingKey.value = !!deviceRecord.value.reportingKey;

        if (hasReportingKey.value) {
            const index = deviceRecord.value.children_key.indexOf(deviceRecord.value.reportingKey, 0);
            if (index > -1) {
                deviceRecord.value.children_key.splice(index, 1);
            }
        }
        childKeys.value = deviceRecord.value.children_key;
    } catch (error) {
        snackbar.add({
            type: 'error',
            text: 'No record found'
        });
    }
});
</script>

<template>
  <div class="container-md my-4" v-if="!isLoading" :key="loadingKey">
    <div class="row justify-content-between">
        <div class="col-sm-6 col-lg-9">
            <h1 class="mt-4 mb-2 text-iris">{{deviceRecord?.deviceName}}</h1>
            <h5>Record Key: {{ route.params.deviceKey }}</h5>
            <div class="my-2"><span v-html="clickableLink(deviceRecord?.description)"></span></div>
        
            <div> 
                <button class="btn mt-1 bg-iris text-white me-4 px-4" @click="viewRecord">View Provenance Records</button>
                <button class="btn mt-1 bg-sky px-5" @click="downloadQRCode">Download QR Code</button>
            </div>
        </div>
        <div class="col-sm-6 col-lg-3 mt-2">
            <QRCode :url="qrCodeUrl" ref="qrcode_component"/>
        </div>
    </div>

    <div v-if="hasReportingKey"> Reporting Key:
        <div> <a :href="`/history/${deviceRecord?.reportingKey}`">{{deviceRecord?.reportingKey}}</a></div>
    </div>
    <div v-if="(childKeys?.length > 0) || hasReportingKey ">
        <div> Child Keys:
            <div> <KeyList v-bind:keys="childKeys"/> </div>
        </div>    
        <CsvFile :recordKey="_recordKey"></CsvFile>
    </div>
  </div>
</template>
<script lang="ts">
import GenerateQRCode from '~/components/GenerateQRCode.vue';
import KeyList from '~/components/KeyList.vue';
import { getProvenance } from '~/services/azureFuncs';
import clickableLink from '~/utils/clickableLink';
import QRCode from '@/components/QRCode.vue';

let deviceRecord: any;

 // Here we are are going to want to read the device,
 //    but not all the provenance. We will use this to load
 //    the two components above, the reporting key component and
 //    the child list component.
 //    At present, get Provenance is our only function;
 //    we do not have a function for returning only the first
//    record of a device, but we probably should.

export default {
    components: {
        GenerateQRCode,
        KeyList,
    },
    data() {
        return {
            isLoading: true,
            hasReportingKey: false,
            childKeys: [] as string[],
            loadingKey: 0,
        }
    },
    methods: {
        //This method helps rerendering the site
        forceRerender() { 
            this.loadingKey += 1;
        },
        downloadQRCode() {
            const qrCodeComponent = this.$refs.qrcode_component as any;
            qrCodeComponent?.downloadQRCode()
        },
        viewRecord() {
            const route = useRoute();
            navigateTo(`/history/${route.params.deviceKey as string}`);
        }
    },
    async mounted() {
        try {
            const route = useRoute();
            const deviceKey = route.params.deviceKey as string;
            const response = await getProvenance(deviceKey);
            deviceRecord = response[response.length - 1].record;
            this.isLoading = false;
            this.hasReportingKey = (deviceRecord.reportingKey ? true : false);
            // We will remove the reportingKey, because although it is a child,
            // we have already rendered it.
            if (this.hasReportingKey) {
                const index = deviceRecord.children_key.indexOf(deviceRecord.reportingKey, 0);
                if (index > -1) {
                    deviceRecord.children_key.splice(index, 1);
                }
            }
            this.childKeys = deviceRecord.children_key;
        } catch (error) {
            this.$snackbar.add({
                type: 'error',
                text: 'No record found'
            });
        }
    }
};


</script>