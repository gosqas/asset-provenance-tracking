<template>
    <button type="button" class="btn mt-1 bg-sky px-5 mb-5" v-on:click="downloadCSV">
        Download Children Keys as CSV
    </button>

</template>

<script>

import { getChildrenKeys } from '~/utils/descendantList';

export default {
    props: {
        recordKey: {
        type: String,
        required: true,
        },
    },

    methods: {
        async downloadCSV() {
            let keyList = await getChildrenKeys(this.recordKey);
            // Convert key to a link
            keyList = keyList.map(key => 'https://gosqas.org/history/' + key);
            // Replace comas with new lines
            keyList = String(keyList).replaceAll(",", "\n");

            const anchor = document.createElement('a');
            anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(keyList);
            anchor.target = '_blank';
            anchor.download = 'keys.csv';
            anchor.click();
        }
    }
}


</script>