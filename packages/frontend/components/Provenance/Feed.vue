<!--
Feed.vue -- Display the feed of reports for a record
Copyright (C) 2024 GOSQAS Team
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
    This component is used to display the feed of reports for a record.
    It is used in the providence/[deviceKey].vue page.
-->
<template>
    <div>
        <div v-for="(report, index) in provenance" class="report-box">
            <template v-if="report.record.blobType === 'deviceInitializer'">
                <h3 id="createdDevicePoint">Created Record: {{ report.record.deviceName }}</h3>
            </template>

            <div
                style="font-size: small; font-family: 'Poppins', sans-serif; font-weight: 500; font-size: 12px; line-height: 30px; color: #1E2019;">
                {{ new Date(report.timestamp) }}
            </div>
            <div style="font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 20px; line-height: 30px;">
                <span v-html="clickableLink(report.record?.description)"></span>
            </div>
            <div class="mb-1 tag-container">
                <span class="tag" v-for="tag in report.record.tags"
                    v-bind:style="'color: ' + textColorForTag(tag) + '; background-color: ' + getColorForTag(tag) + ';'">
                    {{ tag }}</span>
            </div>


            <div v-for="(attachment, i) in attachmentURLs[index.toString()]" :key="i" class="attachment-wrapper">
                <img :src="attachment.url" :alt="attachment.fileName" class="thumbnail" data-bs-toggle="modal"
                    data-bs-target="#imageModal" @click="modalImage = attachment.url">
                <a :href="attachment.url" :download="attachment.fileName" class="download-link">
                    Download File
                </a>
            </div>


        </div>
    </div>
    <!-- The Modal to Enlarge Image -->
    <!-- Image Preview Modal -->
    <!-- Image Preview Modal -->
    <!-- Image Preview Modal -->
<div class="modal fade" id="imageModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <img :src="attachment.url" :alt="attachment.fileName" class="modal-image">
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { getAttachment } from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';
import { textColorForTag, getColorForTag } from '~/utils/colorTag';


export default {
    props: {
        recordKey: {
            type: String,
            default: "",
        },
        provenance: {
            default: null,
        },
    },
    data() {
        return {
            attachmentURLs: {},
            modalImage: "",
        };
    },
    mounted() {
        this.refreshPage();
    },
    beforeDestroy() {
        EventBus.off('feedRefresh', this.refreshPage);
    },
    methods: {
        async fetchAttachmentsForReport(report, index) {
            try {
                if (report.attachments.length > 0) {
                    const baseUrl = useRuntimeConfig().public.baseUrl;
                    const attachmentPromises = report.attachments.map(attachmentID => getAttachment(baseUrl, this.recordKey, attachmentID));
                    const attachments = await Promise.all(attachmentPromises);

                    // Create object URLs for attachments and include filenames
                    const urls = attachments.map(attachment => ({
                        url: URL.createObjectURL(attachment.blob),
                        fileName: attachment.fileName
                    }));

                    this.attachmentURLs[index.toString()] = urls;
                }
            } catch (error) {
                console.error('Error occurred during getAttachment request:', error);
            }
        },
        refreshPage() {
            // set attachmentURLs to empty object to clear out old attachment URLs
            this.attachmentURLs = {};
            this.provenance.forEach((report, index) => this.fetchAttachmentsForReport(report, index));
        }
    },
};
</script>

<style scoped>
.report-box {
    background-color: #F1F5F9;
    padding: 20px;
    margin-bottom: 14px;
    margin-top: 14px;
    border-radius: 20px;
    width: 70%;
    /* Assuming the width is to fill the container */
    word-wrap: break-word;

}

.tag-container {
    display: flex;
    flex-wrap: wrap;
}

.tag {
    background-color: #f2f2f2;
    color: #333;
    padding: 5px 10px;
    margin: 5px;
    border-radius: 5px;
    font-size: 14px;
    transform: scale(1);
    transition-duration: 0.4s;
    margin-left: 0px;
}

.tag:hover {
    transform: scale(1.05);
    cursor: pointer;
}

.attachment-wrapper {
    margin: 10px 0;
}

.thumbnail {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
}

.thumbnail:hover {
    transform: scale(1.05);
}

.download-link {
    display: block;
    padding: 5px;
    margin-top: 5px;
    color: #4e3681;
    text-decoration: none;
}

.download-link:hover {
    text-decoration: underline;
}

/* Modal Styles */

.modal-header {
    border: none;
    padding: 1rem;
    position: absolute;
    right: 0;
    z-index: 1;
}

.btn-close {
    background-color: white;
    opacity: 0.8;
    border-radius: 50%;
    padding: 0.5rem;
}

.btn-close:hover {
    opacity: 1;
}
.modal-content {
    background-color: rgba(0, 0, 0, 0.9);
    border: none;
}

.modal-body {
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    
    
}

.modal-image {
    display: block;
    height: auto;
    margin: auto;
    max-width: 100%;
    
}
</style>