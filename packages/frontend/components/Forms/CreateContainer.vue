<!-- CreateContainer.vue -- Creation of a Group
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
<template>
    <form enctype="multipart/form-data" class="bg-frost p-3" @submit.prevent="submitForm">
        <h4 class="text-iris mt-1 mb-3">Create New Group</h4>
        <div>
            <input type="text" class="form-control" v-model="name" required placeholder="Group Title">
            <input type="text" class="form-control mt-3" v-model="description" id="device-description" placeholder="Group Description">
            <h4 class="text-iris form-label mt-3 mb-3" for="file">Group Image (optional)</h4>
            <input type="file" class="form-control" accept="*" @change="onFileChange" capture="environment" multiple />
           
            <h4 class="mt-3 mb-3 text-iris">Add Tags (optional)</h4>
            <ProvenanceTagInput class="form-control mt-1 " placeholder="Group Tag" v-model="tags" @updateTags="handleUpdateTags"/>
            <div>
                <span v-for="(tag, index) in tags" :key="tag"> {{ tag }}{{ index !== tags.length - 1 ? ', ' : '' }}</span>
            </div>
 
 
 
 
            <h4 class="text-iris my-4 mb-0" for="children-keys">Number of Grouped Records (optional)
                <input type="number" class="form-inline" id="children-keys" v-model="childrenKeys" min="0" max="500" @change="displayFields">
            </h4>
 
 
            <br>
            <h4 class="text-iris p-1 mt-0 mb-0 ">
                <input type="checkbox" class="form-check-input" id="customize-yes" name="customize"  @change="displayFields"/> Customize Grouped Record Titles?
            </h4>
 
 
            <div class="text-iris" id="num-fields" style="display:none" >
                <label for="input"></label>
            </div>
 
 
            <br>
            <h4 class="text-iris p-1 mt-0 mb-0 ">
                <input type="checkbox" class="form-check-input" id="report-key" v-model="createReportingKey" /> Create Reporting Key?
            </h4>
 
 
            <br>
            <h4 class="text-iris p-1 mt-0">
                <input type="checkbox" class="form-check-input" id="notify-all"/> Notify all Children?
            </h4>

        </div>
       
        <div class="d-grid">
            <ButtonComponent class="my-4 mb-0 submit-btn" buttonText="Create Group" type="submit" />
        </div>
    </form>
 </template>

<script lang="ts">
import { postProvenance } from '~/services/azureFuncs';
import { makeEncodedDeviceKey } from '~/utils/keyFuncs';

import ButtonComponent from '../ButtonComponent.vue';
import { isNavigationFailure } from 'vue-router';

export default {
    data() {
        return {
            name: '',
            description: '',
            tags: [] as string[],
            childrenKeys: 0,
            createReportingKey: false,
            hasParent: false, // states whether this device is contained within a box/group
            pictures: [] as File[] | null,
        }
    },
    methods: {
        handleUpdateTags(tags: string[]) {
            this.tags = tags;
        },
        onFileChange(e: Event) {
            const target = e.target as HTMLInputElement;
            const files = target.files;
            if (files) {
                this.pictures = Array.from(files);
            }
        },
        displayFields() {
            const childrenNum = (<HTMLInputElement>document.getElementById("children-keys")).value;

            const customize_yes = (<HTMLInputElement>document.getElementById("customize-yes"));
            const customize_no = (<HTMLInputElement>document.getElementById("customize-no"));
            
            var newInput, newLabel;
            var wrapper_div = document.getElementById('num-fields') as HTMLInputElement;
            var fieldset = document.createElement('div') as HTMLInputElement;

            while (wrapper_div.hasChildNodes()) {
                wrapper_div.removeChild(wrapper_div.firstChild!);
            }

            for (var i=0; i<Number(childrenNum); i++) {
                    newInput = document.createElement('input');
                    newInput.id = 'name-input-' + (i);
                    newInput.type = 'text';
                    newInput.style.border = "0px";
                    newInput.style.borderRadius = "4px";
                    newInput.style.margin = "3px"
                    newInput.required = true;
                    newLabel =  document.createElement('label');
                    newLabel.textContent = 'Device #'+ (i+1) +' Name:  ';
                    fieldset.appendChild(newLabel);
                    fieldset.appendChild(newInput);
                    fieldset.appendChild(document.createElement('br'));
            }

            if (customize_yes.checked) {
                wrapper_div.append(fieldset);
                wrapper_div.style.display = "inline";

            } else {
                wrapper_div.style.display = "none";
            }
            
            
        },

        async submitForm() {
            const deviceKey = await makeEncodedDeviceKey();

            // This code is copied from Judith;
            // I am going to retain her names even though they are
            // redundant until I get this workin.
            const hasReportingKey = this.createReportingKey;
            const numChildren = this.childrenKeys as Number;
            const childrenDeviceList = [];
            const childrenDeviceName = [];
            let reportingKey;

            if ((<HTMLInputElement>document.getElementById("notify-all")).checked) {
                this.tags = (this.tags).concat(['notify_all'])
            } 

            if (hasReportingKey) {
                reportingKey =  await makeEncodedDeviceKey(); //reporting key = public key
                let tag_set = (this.tags).concat(['reportingkey']);

                try {
                    await postProvenance(reportingKey, {
                        blobType: 'deviceInitializer',
                        deviceName: this.name,
                        // Is this a proper description? Should it say "reporting key" or something?
                        description: this.description,
                        tags: tag_set,
                        children_key: '',
                        hasParent: true,
                        isReportingKey: true,
                    }, this.pictures || [])
                    
                    this.$snackbar.add({
                        type: 'success',
                        text: 'Successfully created reporting key'
                    })
                } catch (error) {
                    this.$snackbar.add({
                        type: 'error',
                        text: `Error creating reporting key: ${error}`
                    })
                };
                childrenDeviceList.push(reportingKey);
                childrenDeviceName.push(name);
            }

            if (numChildren) {
                const customize_yes = (<HTMLInputElement>document.getElementById("customize-yes"));
                var childName;

                for (let i = 0; i < Number(numChildren); i++) {
                    const childKey =  await makeEncodedDeviceKey();

                    if (customize_yes.checked) {
                        // user has selected to customize names. use the inputted names.
                        childName = (<HTMLInputElement>document.getElementById("name-input-" + i)).value
                    } else {
                        // user not customizing names. use default.                        
                        childName = this.name + " #" + String(i + 1);
                    }

                    try {
                        await postProvenance(childKey, {
                            blobType: 'deviceInitializer',
                            deviceName: childName,
                            description: this.description,  // need to see if we want a special description when making a child
                            tags:this.tags,
                            children_key: '',
                            hasParent: true,
                            isReportingKey: false
                        }, this.pictures || [])
                        
                        childrenDeviceList.push(childKey);
                        childrenDeviceName.push(childName);
                        
                        this.$snackbar.add({
                            type: 'success',
                            text: 'Successfully created child key'
                        })
                    } catch (error) {
                        this.$snackbar.add({
                            type: 'error',
                            text: `Error creating child key: ${error}`
                        })
                    };                
                }
            };
            try {
                await postProvenance(deviceKey, {
                    blobType: 'deviceInitializer',
                    deviceName: this.name,
                    description: this.description,
                    tags:this.tags,
                    reportingKey: reportingKey,
                    children_key: childrenDeviceList,
                    children_name: childrenDeviceName,
                    hasParent: false,
                    isReportingKey: false
                }, this.pictures || [])
                
                this.$snackbar.add({
                    type: 'success',
                    text: 'Successfully created the group'
                })

                // Navigate to the new group page
                const failure = await this.$router.push({ path: `/record/${deviceKey}` });

                if (isNavigationFailure(failure)) {
                    this.$snackbar.add({
                        type: 'error',
                        text: `Navigation failure from: ${failure.from} to: ${failure.to} type: ${failure.type} cause: ${failure.cause}!`
                    })
                }
            } catch (error) {
                this.$snackbar.add({
                    type: 'error',
                    text: `Error creating the group: ${error}`
                })
            }
        },
    }

}
</script>

<style scoped>
    form {
        border-radius: 10px;
        padding: 30px;
        width: 100%;
        display: block;
        margin-left: auto;
        margin-right: auto;

    }
    /* Style for the placeholder text */
    .form-control::placeholder {
    color: gray;
    }
    #container-form > * {
        padding: 5px;
        margin: 5px;
        display: flex;
        flex-direction: column;
        width: 70%
    }
    #submit-button {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 100%;
        margin-top: 30px;

    }
    input[type=number] {
        border: 0px;
        border-radius: 4px;
    }
    input[type=checkbox] {
        width:25px;
        border: 0px;
        margin-right: 15px;
    }
    .num-fields {
        border: 0px;
        border-radius: 4px;
        border-color:red;
    }
    input[type=text] {
        border:5px;
        border-color:red;
    }
</style>
